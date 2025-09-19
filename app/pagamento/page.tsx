"use client";
import Image from "next/image";
import { useLanguage } from "@/contexts/LanguageContext";
import { ArrowLeft, X, Clock, CheckCircle, AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import ClipboardJS from "clipboard";

export default function CheckoutPage() {
  const { t } = useLanguage();
  const router = useRouter();
  const [showPayment, setShowPayment] = useState(false);
  const [isCodeCopied, setIsCodeCopied] = useState(false);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<
    "checking" | "success" | "failed"
  >("checking");
  const copyButtonRef = useRef<HTMLButtonElement>(null);
  const [isClient, setIsClient] = useState(false);

  // useEffect para garantir que estamos no cliente
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Estados para integração com API de pagamento
  const [paymentData, setPaymentData] = useState<any>(null);
  const [isLoadingPayment, setIsLoadingPayment] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState<string>("15:00");

  // Função helper para formatar preço com vírgula
  const formatPrice = (valueInCents: number) => {
    return (valueInCents / 100).toFixed(2).replace(".", ",");
  };

  // Código PIX exemplo (normalmente viria de uma API)
  const pixCode =
    paymentData?.qr_code ||
    "00020126580014br.gov.bcb.pix0136123e4567-e12b-12d1-a456-426614174000520400005303986540519.905802BR5925PRIVACYCLUB DIGITAL LTDA6009SAO PAULO62070503***6304A1B2";
  const handleConfirmData = () => {
    // Dispara evento de Facebook Pixel para InitiateCheckout (apenas no cliente)
    if (isClient && typeof window !== "undefined" && (window as any).fbq) {
      (window as any).fbq("track", "InitiateCheckout", {
        value: 0.19,
        currency: "BRL",
      });
    }

    // Inicia o processo de pagamento
    abrirPagamento("1 Mês");
  };

  // Função para abrir pagamento PIX baseada no script fornecido
  const abrirPagamento = async (plano: string) => {
    try {
      setIsLoadingPayment(true);

      const valores = {
        Vitalicio: { label: "Vitalicio", valor: 2990 },
        "1 Mês": { label: "1 Mês", valor: 300, apiValue: 3.0 }, // R$ 3,00 -> send 3.00 to API
        Trimestral: { label: "Trimestral", valor: 1990 },
      };

      const planoInfo = valores[plano as keyof typeof valores];
      if (!planoInfo) throw new Error("Plano inválido");
      // Gerar cobrança PIX usando API local

      // Chama a API local que por sua vez chama a API externa
      const resposta = await fetch("/api/pix", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          // send value in reais as decimal; prefer explicit apiValue when provided
          value:
            planoInfo && (planoInfo as any).apiValue !== undefined
              ? Number((planoInfo as any).apiValue)
              : Number((planoInfo.valor / 100).toFixed(2)),
          name: "Cliente Privacy Black",
          email: "cliente@privacyblack.local",
          description: `Pagamento do plano ${planoInfo.label}`,
          webhook_url: "https://seuservico.com/webhook",
          metadata: { plano: planoInfo.label },
        }),
      });

      const dados = await resposta.json();
      // Resposta da API local recebida com sucesso

      if (!resposta.ok || !dados.qr_code) {
        throw new Error(dados.error || "Erro ao gerar pagamento");
      } // Atualiza os dados de pagamento
      setPaymentData({
        ...dados,
        planoInfo,
        id: dados.id,
      });

      // Inicializa o contador com 15 minutos se não houver expires_at (apenas no cliente)
      if (!dados.expires_at && isClient) {
        const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();
        setPaymentData((prev: any) => ({ ...prev, expires_at: expiresAt }));
      }

      setIsLoadingPayment(false);
      setShowPayment(true);

      // Inicia verificação de pagamento
      verificarPagamento(dados.id, planoInfo);
    } catch (erro: any) {
      console.error("Erro ao gerar pagamento:", erro);
      setIsLoadingPayment(false);
      alert("Erro ao gerar pagamento: " + erro.message);
    }
  };
  // Função para verificar pagamento
  // Polling robusto: faz requisições a cada 5s até pagamento confirmado ou timeout de 10 minutos
  const verificarPagamento = async (id: string, planoInfo: any) => {
    setVerificationStatus("checking");

    const start = Date.now();
    const timeoutMs = 10 * 60 * 1000; // 10 minutos
    let stopped = false;

    const stop = () => {
      stopped = true;
    };

    const poll = async () => {
      if (stopped) return;
      try {
        const resposta = await fetch(`/api/pix?id=${encodeURIComponent(id)}`);
        if (!resposta.ok) {
          // Não interrompe o polling apenas por um erro temporário
          const err = await resposta.text();
          console.error("Erro ao consultar /api/pix:", resposta.status, err);
        } else {
          const dados = await resposta.json();
          const status =
            dados?.status ||
            dados?.data?.status ||
            dados?.data?.payment?.status ||
            dados?.raw?.status ||
            "pending";

          const normalizedStatus = String(status).toLowerCase();

          console.log(
            `[POLLING] Status atual: "${status}" (normalizado: "${normalizedStatus}") para pagamento ID: ${id}`
          );

          if (["paid", "completed", "pago"].includes(normalizedStatus)) {
            console.log(
              `[POLLING] Pagamento confirmado! Status: "${status}". Redirecionando em 2 segundos...`
            );
            stop();
            setVerificationStatus("success");

            // Envia dados para UTMify (apenas no cliente)
            const urlParams =
              isClient && typeof window !== "undefined"
                ? new URLSearchParams(window.location.search)
                : new URLSearchParams();
            const utmSource = urlParams.get("utm_source") || "";
            const utmCampaign = urlParams.get("utm_campaign") || "";
            const utmContent = urlParams.get("utm_content") || "";

            try {
              await fetch("http://143.198.124.228:3000/api/purchase", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  priceInCents: planoInfo.valor,
                  utm_source: utmSource,
                  utm_campaign: utmCampaign,
                  utm_content: utmContent,
                }),
              });
            } catch (e) {
              console.error("Erro ao enviar dados para UTMify:", e);
            }

            // Redireciona para página externa após 2 segundos
            setTimeout(() => {
              console.log(
                `[REDIRECT] Iniciando redirecionamento para: https://imperiovips.com/obg2/`
              );
              router.push("https://imperiovips.com/obg2/");
            }, 2000);
            return;
          }
        }
      } catch (e) {
        console.error("Erro ao verificar pagamento:", e);
      }

      if (Date.now() - start >= timeoutMs) {
        stop();
        console.warn(
          "Polling expirado: pagamento não confirmado em 10 minutos"
        );
        setVerificationStatus("failed");
        return;
      }

      // aguarda 5s antes da próxima tentativa
      setTimeout(poll, 5000);
    };

    // inicia o loop
    poll();

    // retorna função de limpeza caso o chamador queira parar o polling
    return stop;
  };

  // Configuração do ClipboardJS
  useEffect(() => {
    if (!isClient) return;

    console.log("Configurando ClipboardJS...");

    if (copyButtonRef.current && showPayment) {
      console.log("Botão encontrado, inicializando clipboard");

      const clipboard = new ClipboardJS(copyButtonRef.current, {
        text: () => {
          console.log("ClipboardJS: Copiando texto:", pixCode);
          return pixCode;
        },
      });

      clipboard.on("success", (e) => {
        console.log("Sucesso! Código PIX copiado:", e.text);
        setIsCodeCopied(true);

        // Resetar o estado após 3 segundos
        setTimeout(() => {
          setIsCodeCopied(false);
        }, 3000);

        e.clearSelection();
      });

      clipboard.on("error", (e) => {
        console.error("Erro ClipboardJS:", e);
        console.log("Tentando fallback manual...");

        // Fallback para método manual
        copyToClipboardFallback();
      });

      return () => {
        console.log("Destruindo ClipboardJS");
        clipboard.destroy();
      };
    } else {
      console.log("Botão não encontrado ou não está na tela de pagamento");
    }
  }, [pixCode, showPayment, isClient]);

  // useEffect para contador de tempo do PIX
  useEffect(() => {
    if (!showPayment || !paymentData?.expires_at) return;

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const expiresAt = new Date(paymentData.expires_at).getTime();
      const difference = expiresAt - now;

      if (difference > 0) {
        const minutes = Math.floor(
          (difference % (1000 * 60 * 60)) / (1000 * 60)
        );
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);
        setTimeRemaining(
          `${minutes.toString().padStart(2, "0")}:${seconds
            .toString()
            .padStart(2, "0")}`
        );
      } else {
        setTimeRemaining("00:00");
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [showPayment, paymentData?.expires_at]);

  const copyToClipboardFallback = async (): Promise<boolean> => {
    if (!isClient) return false;

    try {
      // Tenta navigator.clipboard primeiro
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(pixCode);
        console.log("Cópia com navigator.clipboard funcionou");
        setIsCodeCopied(true);
      } else if (typeof document !== "undefined") {
        // Fallback para execCommand
        const textArea = document.createElement("textarea");
        textArea.value = pixCode;
        textArea.style.position = "fixed";
        textArea.style.left = "-999999px";
        textArea.style.top = "-999999px";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
        console.log("Cópia com execCommand funcionou");
        setIsCodeCopied(true);
      } else {
        return false;
      }

      setTimeout(() => {
        setIsCodeCopied(false);
      }, 3000);

      return true;
    } catch (err) {
      console.error("Erro no fallback:", err);
      return false;
    }
  };

  const handleCopyPixCode = async () => {
    if (!isClient) return;

    console.log("handleCopyPixCode chamado - executando fallback diretamente");
    const copied = await copyToClipboardFallback();

    // Abre o modal de verificação se a cópia foi bem sucedida
    if (copied) {
      setShowVerificationModal(true);
      setVerificationStatus("checking");
    }
  };

  const handlePaymentConfirmation = () => {
    setShowVerificationModal(true);
    setVerificationStatus("checking");

    // Se temos dados de pagamento, verificar o status real
    if (paymentData?.id) {
      // A verificação já está rodando em background, apenas mostra o modal
      console.log(
        "Verificação de pagamento já está ativa para ID:",
        paymentData.id
      );
    } else {
      // Fallback para simulação (caso não tenha dados de pagamento)
      setTimeout(() => {
        // Removido Math.random() para evitar problemas de hidratação
        setVerificationStatus("checking"); // Mantém checking até dados reais
      }, 3000);
    }
  };

  const closeVerificationModal = () => {
    setShowVerificationModal(false);
    setVerificationStatus("checking");
  };

  // Evita problemas de hidratação renderizando apenas no cliente
  if (!isClient) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-2 text-gray-300">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* HEADER FIXO SUPERIOR - Banner de verificação do Telegram */}
      <div className="fixed top-0 left-0 w-full bg-black h-[35px] flex items-center justify-center z-[1000] shadow-md overflow-hidden">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 flex items-center justify-center">
            <img
              alt="Verificado"
              src="./verified.webp"
              className="w-5 h-5 object-contain"
            />
          </div>{" "}
          <span className="text-white text-sm font-medium tracking-wide font-[Inter,-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif]">
            {t("verified.app")}
          </span>
        </div>{" "}
      </div>
      {/* Header de navegação */}
      <header className="bg-black border-b border-gray-800 px-4 sticky top-[35px] z-50 h-[65px] flex items-center animate-in fade-in duration-300">
        <div className="flex items-center justify-between w-full">
          {" "}
          {/* Botão Voltar */}
          <button
            onClick={() => router.back()}
            className="inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium h-10 w-10 hover:text-white hover:bg-gray-800 transition-all duration-200 hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-500"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          {/* Logo Central */}
          <div className="flex items-center justify-center flex-1">
            <div className="flex items-center gap-[0.3rem]">
              <div className="flex items-center justify-center">
                <Image
                  src="/image.png"
                  alt="Privacy Black Icon"
                  width={32}
                  height={32}
                  className="object-contain"
                />
              </div>
              <div className="flex flex-col">
                <h1 className="text-2xl font-bold italic leading-tight font-['Poppins',sans-serif]">
                  <span className="text-white">Privacy Black</span>
                </h1>
              </div>
            </div>
          </div>{" "}
          {/* Preço */}
          <div className="text-right">
            <div className="text-xs text-white font-semibold">Pagando</div>
            <div className="text-sm font-bold text-orange-500">
              R${" "}
              {paymentData?.planoInfo
                ? formatPrice(paymentData.planoInfo.valor)
                : "3,00"}
            </div>{" "}
          </div>
        </div>
      </header>{" "}
      {/* Banner Premium Plano */}
      <div className="w-full mt-8">
        <Image
          src="/BannerCheckoutPremiumPlano.webp"
          alt="Banner Checkout Premium Plano"
          width={1200}
          height={400}
          className="w-full h-auto object-cover"
          priority
        />
      </div>{" "}
      {/* Indicador de progresso */}
      <div className="bg-black px-4 py-3 border-b border-gray-800 animate-in slide-in-from-top duration-500">
        {/* Bolinhas de progresso */}
        <div className="flex items-center justify-center space-x-2">
          {/* Etapa 1 */}
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-300 ${
              !showPayment
                ? "bg-orange-500 text-white scale-105"
                : "bg-green-500 text-white"
            }`}
          >
            1
          </div>

          {/* Linha entre as etapas */}
          <div
            className={`w-16 h-1 transition-all duration-500 ${
              showPayment ? "bg-orange-500" : "bg-gray-200"
            }`}
          />

          {/* Etapa 2 */}
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-300 ${
              showPayment
                ? "bg-orange-500 text-white scale-105"
                : "bg-gray-200 text-gray-500"
            }`}
          >
            2
          </div>
        </div>{" "}
        {/* Descrições abaixo */}
        <div className="flex justify-between mt-2 text-xs">
          <span className="text-white font-semibold">Confirmar dados</span>
          <span className="text-white font-semibold">Pagamento</span>
        </div>
      </div>{" "}
      {/* Seção de confirmação de dados ou pagamento */}
      {!showPayment ? (
        <div className="px-4 py-6">
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom duration-500">
            {/* Título */}

            {/* Bloco de dados do usuário */}

            {/* Bloco do plano premium */}
            <div className="rounded-lg border border-gray-800 bg-gray-900 text-white shadow-sm p-6 animate-in fade-in slide-in-from-bottom duration-600 delay-300 hover:shadow-lg transition-shadow">
              <div className="text-center space-y-3">
                <h3 className="text-lg font-semibold text-white">
                  Plano Mensal Premium
                </h3>
                <div className="text-3xl font-bold text-orange-600">
                  R$ 3,00
                </div>
                <div className="text-sm text-gray-600 space-y-1">
                  <p>✅ +3.000 Modelos no Premium</p>
                  <p>✅ +100 mil mídias exclusivas</p>
                  <p>✅ Acesso imediato após pagamento</p>
                  <p>✅ Equipe de Suporte 24 horas</p>
                </div>

                {/* Garantia */}
                <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4 my-4">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="lucide lucide-circle-check-big h-4 w-4 text-white"
                      >
                        <path d="M21.801 10A10 10 0 1 1 17 3.335"></path>
                        <path d="m9 11 3 3L22 4"></path>
                      </svg>
                    </div>
                    <h4 className="text-lg font-bold text-green-800">
                      30 DIAS DE GARANTIA!
                    </h4>
                  </div>
                  <p className="text-sm font-semibold text-green-700">
                    Não gostou? Peça reembolso.
                  </p>
                </div>
              </div>
            </div>

            {/* Botões */}
            <div className="space-y-3 animate-in fade-in slide-in-from-bottom duration-600 delay-400">
              {" "}
              <button
                onClick={handleConfirmData}
                disabled={isLoadingPayment}
                className="inline-flex items-center justify-center gap-2 h-10 px-4 w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-4 text-lg rounded-xl transition-all duration-200 hover:scale-[1.02] hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {isLoadingPayment ? (
                  <>
                    <svg
                      className="animate-spin h-5 w-5 mr-2"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Gerando pagamento...
                  </>
                ) : (
                  "Confirmar dados e continuar"
                )}
              </button>
              <button className="inline-flex items-center justify-center gap-2 text-sm border bg-background h-10 px-4 w-full border-gray-300 text-gray-700 font-medium py-3 rounded-xl transition-all duration-200 hover:scale-[1.02] hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none">
                Cancelar
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="px-4 py-6">
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom duration-500">
            <div className="text-center animate-in fade-in duration-700 delay-100">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="lucide lucide-circle-check-big w-12 h-12 text-green-500 mx-auto mb-3 animate-pulse"
              >
                <path d="M21.801 10A10 10 0 1 1 17 3.335"></path>
                <path d="m9 11 3 3L22 4"></path>
              </svg>
              <h1 className="text-2xl font-bold text-white mb-2">
                Finalize seu pagamento
              </h1>
              <p className="text-gray-100">
                Escaneie o QR Code ou copie o código PIX
              </p>{" "}
              <div className="mt-2 text-sm text-gray-500">
                Valor:{" "}
                <span className="font-semibold text-orange-600">
                  R${" "}
                  {paymentData?.planoInfo
                    ? formatPrice(paymentData.planoInfo.valor)
                    : "3,00"}
                </span>
              </div>{" "}
              <div
                className={`mt-3 border rounded-lg p-3 ${
                  timeRemaining === "00:00"
                    ? "bg-red-50 border-red-200"
                    : "bg-orange-50 border-orange-200"
                }`}
              >
                <div
                  className={`flex items-center justify-center gap-2 ${
                    timeRemaining === "00:00"
                      ? "text-red-700"
                      : "text-orange-700"
                  }`}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="lucide lucide-clock w-4 h-4"
                  >
                    <circle cx="12" cy="12" r="10"></circle>
                    <polyline points="12 6 12 12 16 14"></polyline>
                  </svg>{" "}
                  <span className="text-sm font-medium">
                    {timeRemaining === "00:00"
                      ? "PIX expirado"
                      : `PIX expira em: `}
                    <span className="font-bold">
                      {timeRemaining === "00:00" ? "" : timeRemaining}
                    </span>
                  </span>
                </div>
              </div>
            </div>{" "}
            <div className="rounded-lg border border-gray-800 bg-gray-900 text-white shadow-sm p-6 animate-in fade-in slide-in-from-bottom duration-600 delay-200 hover:shadow-lg transition-shadow">
              <div className="text-center space-y-4">
                <div className="flex items-center justify-center gap-2">
                  <h3 className="text-lg font-semibold text-white">
                    QR Code PIX
                  </h3>
                </div>{" "}
                <div className="bg-white border-2 border-gray-200 rounded-lg p-6 mx-auto w-fit transition-transform duration-300 hover:scale-105">
                  <div className="w-48 h-48">
                    <img
                      alt="QR Code PIX"
                      className="w-full h-full object-contain rounded-lg"
                      src={
                        paymentData?.qr_code_base64
                          ? `${paymentData.qr_code_base64}`
                          : "data:image/png;base64,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"
                      }
                    />
                  </div>
                </div>
                <div className="mt-3">
                  <span>Abra o app do seu banco e escaneie este código</span>
                </div>
              </div>
            </div>
            <div className="rounded-lg border border-gray-800 bg-gray-900 text-white shadow-sm p-6 animate-in fade-in slide-in-from-bottom duration-600 delay-300 hover:shadow-lg transition-shadow">
              <div className="space-y-4">
                <div className="flex items-center justify-center gap-2">
                  <h3 className="text-lg font-semibold text-white text-center">
                    Código PIX Copia e Cola
                  </h3>
                </div>
                <div className="bg-gray-800 border border-gray-700 rounded-lg p-3 transition-all duration-200 hover:bg-gray-700">
                  <p className="text-xs text-gray-100 font-mono break-all leading-relaxed">
                    {pixCode}
                  </p>{" "}
                </div>{" "}
                <button
                  ref={copyButtonRef}
                  type="button"
                  onClick={handleCopyPixCode}
                  className={`inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-10 px-4 w-full font-semibold py-3 rounded-xl transition-all duration-200 hover:scale-[1.02] hover:shadow-lg ${
                    isCodeCopied
                      ? "bg-green-500 hover:bg-green-600 text-white"
                      : "bg-orange-500 hover:bg-orange-600 text-white"
                  }`}
                >
                  {isCodeCopied ? (
                    <>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="w-4 h-4 mr-2 pointer-events-none shrink-0"
                      >
                        <path d="M21.801 10A10 10 0 1 1 17 3.335"></path>
                        <path d="m9 11 3 3L22 4"></path>
                      </svg>
                      Código copiado!
                    </>
                  ) : (
                    <>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="lucide lucide-copy w-4 h-4 mr-2 pointer-events-none shrink-0"
                      >
                        <rect
                          width="14"
                          height="14"
                          x="8"
                          y="8"
                          rx="2"
                          ry="2"
                        ></rect>
                        <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"></path>
                      </svg>
                      Copiar código PIX
                    </>
                  )}
                </button>{" "}
                <button
                  type="button"
                  onClick={handlePaymentConfirmation}
                  className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-10 px-4 w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-3 rounded-xl transition-all duration-200 hover:scale-[1.02]"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="lucide lucide-circle-check-big w-4 h-4 mr-2 pointer-events-none shrink-0"
                  >
                    <path d="M21.801 10A10 10 0 1 1 17 3.335"></path>
                    <path d="m9 11 3 3L22 4"></path>
                  </svg>{" "}
                  Já realizei o pagamento!
                </button>
              </div>
            </div>{" "}
            {/* Garantia de 30 dias */}
            <div className="rounded-lg border bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 shadow-sm p-6 animate-in fade-in slide-in-from-bottom duration-600 delay-400">
              <div className="flex items-center justify-center gap-3">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="w-5 h-5 text-green-600"
                    >
                      <path d="M21.801 10A10 10 0 1 1 17 3.335"></path>
                      <path d="m9 11 3 3L22 4"></path>
                    </svg>
                    <h3 className="text-lg font-bold text-green-700">
                      Garantia de 30 Dias
                    </h3>
                  </div>
                  <p className="text-sm text-green-600 leading-relaxed">
                    Se não ficar satisfeito, devolvemos 100% do seu dinheiro sem
                    perguntas!
                  </p>
                </div>
              </div>
            </div>{" "}
            {/* Informações importantes */}
            <div className="rounded-lg border text-card-foreground shadow-sm p-6 bg-blue-50 border-blue-200 animate-in fade-in slide-in-from-bottom duration-600 delay-500 hover:shadow-lg transition-shadow">
              <div className="space-y-3">
                <h4 className="font-semibold text-blue-900">
                  ℹ️ Informações importantes:
                </h4>
                <div className="text-sm text-blue-800 space-y-1">
                  <p>• O pagamento será processado em até 1 minuto.</p>
                  <p>• Você receberá acesso imediato após confirmação.</p>
                  <p>• Em caso de dúvidas, entre em contato conosco.</p>
                </div>
              </div>
            </div>
            {/* Botão Voltar */}{" "}
            <button
              onClick={() => setShowPayment(false)}
              className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 border bg-background hover:text-accent-foreground h-10 px-4 w-full border-red-300 text-red-700 font-medium py-3 rounded-xl transition-all hover:scale-[1.02] hover:bg-red-50 animate-in fade-in slide-in-from-bottom duration-600 delay-600"
            >
              Voltar
            </button>
          </div>
        </div>
      )}
      {/* Modal de Verificação de Pagamento */}
      {showVerificationModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="relative bg-gray-900 rounded-2xl shadow-2xl max-w-md w-full mx-4 animate-in zoom-in-95 duration-300">
            {/* Header do Modal */}
            <div className="flex items-center justify-between p-6 border-b border-gray-800">
              <h2 className="text-xl font-bold text-white">
                Verificação de Pagamento
              </h2>
              <button
                onClick={closeVerificationModal}
                className="p-2 rounded-full hover:bg-gray-100 transition-colors duration-200"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Conteúdo do Modal */}
            <div className="p-6">
              {verificationStatus === "checking" && (
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 mx-auto">
                    <Clock className="w-16 h-16 text-orange-500 animate-spin" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2">
                      Verificando pagamento...
                    </h3>
                    <p className="text-gray-100">
                      Aguarde enquanto verificamos seu pagamento PIX. Este
                      processo pode levar alguns instantes.
                    </p>
                  </div>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm text-blue-800">
                      💡 <strong>Dica:</strong> Mantenha esta janela aberta até
                      a confirmação.
                    </p>
                  </div>
                </div>
              )}

              {verificationStatus === "success" && (
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 mx-auto">
                    <CheckCircle className="w-16 h-16 text-green-500" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-green-700 mb-2">
                      Pagamento Confirmado!
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Seu pagamento foi processado com sucesso. Você já tem
                      acesso completo ao conteúdo premium!
                    </p>
                  </div>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <p className="text-sm text-green-800">
                      ✅ Acesso liberado imediatamente
                      <br />
                      ✅ Conteúdo premium disponível
                      <br />✅ Suporte 24h ativo
                    </p>
                  </div>{" "}
                  <button
                    onClick={() => {
                      closeVerificationModal();
                      // Redireciona para página externa
                      router.push("https://imperiovips.com/obg2/");
                    }}
                    className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 hover:scale-[1.02]"
                  >
                    Continuar para o Conteúdo
                  </button>
                </div>
              )}

              {verificationStatus === "failed" && (
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 mx-auto">
                    <AlertCircle className="w-16 h-16 text-red-500" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-red-700 mb-2">
                      Pagamento Não Encontrado
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Ainda não conseguimos identificar seu pagamento. Isso pode
                      acontecer por alguns motivos:
                    </p>
                  </div>
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-left">
                    <p className="text-sm text-yellow-800">
                      • O pagamento ainda está sendo processado
                      <br />
                      • Houve um atraso no sistema bancário
                      <br />• O PIX ainda não foi enviado
                    </p>
                  </div>
                  <div className="space-y-3">
                    <button
                      onClick={() => {
                        setVerificationStatus("checking");
                        setTimeout(() => {
                          // Removido Math.random() para evitar problemas de hidratação
                          // Em produção, isso deveria verificar o pagamento real
                          setVerificationStatus("checking");
                        }, 3000);
                      }}
                      className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 hover:scale-[1.02]"
                    >
                      Verificar Novamente
                    </button>
                    <button
                      onClick={closeVerificationModal}
                      className="w-full border border-gray-300 text-gray-700 font-medium py-3 px-4 rounded-xl transition-all duration-200 hover:scale-[1.02] hover:bg-gray-50"
                    >
                      Voltar ao Pagamento
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
