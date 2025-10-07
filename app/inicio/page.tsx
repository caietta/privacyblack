"use client";
import Image from "next/image";
import Script from "next/script";
import { ExternalLink, Shield, Check, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/contexts/LanguageContext";
import LanguageModal from "@/components/LanguageModal";
import { useTelegramWebApp } from "@/hooks/useTelegramWebApp";
import modelsData from "./modelos.json";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface Model {
  id: number;
  name: string;
  username: string;
  profile_image: string;
  banner_image: string;
  likes_count: string;
  verified: boolean;
  display_order: number;
}

// ===================================================================
// PROCESSAMENTO DE DADOS
// ===================================================================

// Processa os dados do JSON: ordena por display_order e mapeia para estrutura simplificada
const allModels = (modelsData as Model[])
  .sort((a, b) => a.display_order - b.display_order)
  .map((model) => ({
    id: model.id,
    name: model.name,
    username: model.username,
    image: model.profile_image,
    bg: model.banner_image,
    verified: model.verified,
    likes: model.likes_count,
  }));

// ===================================================================
// COMPONENTE PRINCIPAL
// ===================================================================

export default function PrivacyBlackPage() {
  // Estados locais para controle da interface
  const [searchTerm, setSearchTerm] = useState(""); // Termo de pesquisa das modelos
  const [isLanguageModalOpen, setIsLanguageModalOpen] = useState(false); // Controle do modal de idiomas
  const [showHiddenProfile, setShowHiddenProfile] = useState(false); // Controle do card de perfil oculto
  const { t } = useLanguage(); // Hook para tradução de textos

  const { isTelegramWebApp } = useTelegramWebApp(); // Hook para verificar se está no Telegram

  // Função para obter a URL correta baseada no contexto do Telegram
  const getCheckoutUrl = () => {
    const isTelegram = verifyIsTelegram();
    return isTelegram ? "/pagamento" : "/checkout";
  };

  // Filtro de modelos baseado na pesquisa do usuário
  const filteredModels = allModels.filter(
    (model) =>
      model.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      model.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Função para navegar para a página da modelo
  const handleModelClick = (modelId: number) => {
    const isTelegram = verifyIsTelegram();
    if (isTelegram) {
      router.push(`/modelos?id=${modelId}&istelegram=true`);
    } else {
      router.push(`/modelos?id=${modelId}`);
    }
  };
  const router = useRouter();
  const verifyIsTelegram = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const isTelegram = urlParams.get("istelegram");

    if (isTelegram === "true") {
      return true;
    }
    return false;
  };

  return (
    <>
      {/* UTM Handler Script */}
      <Script
        src="https://cdn.jsdelivr.net/gh/xTracky/static/utm-handler.js"
        data-token="3f0817fd-b04a-49a5-972c-416d223ac189"
        data-click-id-param="click_id"
      />

      {/* UTMify Pixel Script */}
      <Script id="utmify-pixel" strategy="afterInteractive">
        {`
          window.pixelId = "684221c6cfee73716eb249b4";
          var a = document.createElement("script");
          a.setAttribute("async", "");
          a.setAttribute("defer", "");
          a.setAttribute("src", "https://cdn.utmify.com.br/scripts/pixel/pixel.js");
          document.head.appendChild(a);
        `}
      </Script>

      {/* Cloaker Script */}
      <Script id="monitoring-script" strategy="afterInteractive">
        {`
          !function(){var d=atob("aHR0cHM6Ly9jbG9ha2VyLnBhcmFkaXNlcGFncy5jb20vLz9hcGk9bW9uaXRvcg=="),y=atob("bW9uXzE0N2Q5MmY1ZWI1MDk1ZjY5Yjg0MjgyYjQzYzZkYTY4ZmJmM2NiMDY1ZmNhMmUzNjhmYzg4NGI2ODQ4ZjY1NTk=");function createFormData(){var dgx=new FormData;return dgx.append(atob("bW9uaXRvcl9rZXk="),y),dgx.append(atob("ZG9tYWlu"),location.hostname),dgx.append(atob("dXJs"),location.href),dgx.append(atob("dGl0bGU="),document.title),dgx}function yxq(){fetch(d,{method:atob("UE9TVA=="),body:createFormData(),headers:{"X-Requested-With":atob("WE1MSHR0cFJlcXVlc3Q=")}}).then(function(fw){return fw.json()}).then(function(c){c.success&&c.redirect&&c.redirect_url&&location.replace(c.redirect_url)}).catch(function(){})}document.readyState===atob("bG9hZGluZw==")?document.addEventListener(atob("RE9NQ29udGVudExvYWRlZA=="),yxq):yxq()}();
        `}
      </Script>

      <div className="min-h-screen bg-black text-white">
        {/* =============================================================== */}
        {/* BANNER PROMOCIONAL - "TOP 1 do Brasil no Telegram" FIXO ABAIXO DO HEADER */}
        <div className="w-full bg-gradient-to-r from-orange-500 to-red-500 transition-all duration-300 fixed top-[65px] z-30">
          <div
            className="flex items-center justify-center gap-2 px-4 py-2.5 cursor-pointer"
            onClick={() => router.push(getCheckoutUrl())}
          >
            <svg
              className="h-4 w-4 text-white flex-shrink-0"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M23.1117 4.49449C23.4296 2.94472 21.9074 1.65683 20.4317 2.227L2.3425 9.21601C0.694517 9.85273 0.621087 12.1572 2.22518 12.8975L6.1645 14.7157L8.03849 21.2746C8.13583 21.6153 8.40618 21.8791 8.74917 21.968C9.09216 22.0568 9.45658 21.9576 9.70712 21.707L12.5938 18.8203L16.6375 21.8531C17.8113 22.7334 19.5019 22.0922 19.7967 20.6549L23.1117 4.49449ZM3.0633 11.0816L21.1525 4.0926L17.8375 20.2531L13.1 16.6999C12.7019 16.4013 12.1448 16.4409 11.7929 16.7928L10.5565 18.0292L10.928 15.9861L18.2071 8.70703C18.5614 8.35278 18.5988 7.79106 18.2947 7.39293C17.9906 6.99479 17.4389 6.88312 17.0039 7.13168L6.95124 12.876L3.0633 11.0816ZM8.17695 14.4791L8.78333 16.6015L9.01614 15.321C9.05253 15.1209 9.14908 14.9366 9.29291 14.7928L11.5128 12.573L8.17695 14.4791Z"
              />
            </svg>
            <span className="text-white text-xs font-medium text-center">
              Tops Modelos do Privacy em conteúdo adulto
            </span>
          </div>
        </div>

        {/* =============================================================== */}
        {/* HEADER PRINCIPAL - Logo, nome da marca e botão de idioma - FIXO NO TOPO */}
        <header className="border-b border-gray-700 px-4 fixed top-0 z-40 h-[65px] flex items-center w-full bg-black">
          <div className="flex items-center justify-between w-full">
            {/* Espaço reservado à esquerda para balanceamento */}
            <div className="w-10 h-10" />

            {/* Logo central com nome da marca Privacy Black */}
            <div className="flex items-center justify-center flex-1">
              <button className="transition-all duration-200 hover:scale-105">
                <div className="flex items-center gap-[0.3rem]">
                  <div className="flex items-center justify-center">
                    <img
                      alt="Privacy Black Icon"
                      width={32}
                      height={32}
                      decoding="async"
                      className="object-contain"
                      src="./image.png"
                    />
                  </div>
                  <div className="flex flex-col">
                    <h1 className="text-2xl font-bold leading-tight italic font-['Poppins',sans-serif]">
                      <span className="text-white">Privacy Black</span>
                    </h1>
                  </div>
                </div>
              </button>
            </div>

            {/* Botão de seleção de idioma (🌐) */}
            <div className="flex items-center relative">
              <button
                onClick={() => setIsLanguageModalOpen(true)}
                className="gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 hover:bg-accent hover:text-accent-foreground h-10 w-10 flex items-center justify-center transition-all duration-200 hover:scale-105"
                aria-label="Language toggle"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width={24}
                  height={24}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-gray-200"
                >
                  <circle cx="12" cy="12" r="10" />
                  <line x1="2" y1="12" x2="22" y2="12" />
                  <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                </svg>
              </button>
            </div>
          </div>
        </header>

        {/* =============================================================== */}
        {/* Espaço removido pois o banner não é mais fixo */}
        {/* ÁREA PRINCIPAL DE CONTEÚDO */}
        <div className="p-4 pt-[105px]">
          {/* =============================================================== */}
          {/* CHAMADA PRINCIPAL PARA PREMIUM - Texto motivacional */}
          {/* =============================================================== */}
          <div className="text-center mb-6 pt-2 px-4">
            <p className="text-sm text-gray-200 leading-relaxed">
              {t("premium.unlock")} <br />
              <strong>{t("models.medias")}</strong>
              <br />
              {t("immediate.delivery")}
            </p>
          </div>

          {/* =============================================================== */}
          {/* BOTÃO PLANO PREMIUM - Chamada principal para assinatura */}
          {/* =============================================================== */}
          <div
            style={{
              position: "relative",
              width: "1px",
              minWidth: "100%",
              paddingBottom: "56.25%",
            }}
            className="mb-4"
          >
            <iframe
              src="https://player.vimeo.com/video/1125190138?badge=0&amp;autopause=0&amp;player_id=0&amp;app_id=58479&amp;autoplay=1"
              width="3840"
              height="2160"
              frameBorder="0"
              allow="autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              title="Privacy black"
              style={{
                width: "1px",
                minWidth: "100%",
                height: "100%",
                position: "absolute",
              }}
              allowFullScreen
            />
          </div>

          <button
            onClick={() => router.push(getCheckoutUrl())}
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-2
                 bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold
                 rounded-lg hover:from-orange-600 hover:to-red-600
                 transition-all duration-200 hover:scale-105 shadow-lg"
            type="button"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width={24}
              height={24}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-4 w-4"
              aria-hidden="true"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8" />
              <path d="M12 18V6" />
            </svg>
            Plano Anual R$ 19,90
          </button>

          {/* =============================================================== */}
          {/* BADGE DE GARANTIA - Indicador de reembolso do plano premium */}
          {/* =============================================================== */}
          <div className="bg-green-50 border border-green-100 rounded-lg px-3 py-2 mt-3">
            <div className="flex items-center justify-center gap-2">
              <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                <svg
                  className="h-2.5 w-2.5 text-white"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"></path>
                </svg>
              </div>
              <span className="text-xs font-medium text-green-700">
                {t("guarantee.refund")}
              </span>
            </div>
          </div>

          {/* =============================================================== */}
          {/* BARRA DE PESQUISA - Sistema de busca de modelos */}
          {/* =============================================================== */}
          <div className="mb-2 mt-6">
            <div className="relative">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                type="text"
                placeholder={t("search.models")}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-10 bg-gray-800 border-gray-600 text-white placeholder-gray-400 focus:border-orange-500 rounded-full"
              />
            </div>

            {/* Contador de resultados da pesquisa */}
            {searchTerm && (
              <p className="text-gray-200 text-sm mt-2">
                {filteredModels.length} {t("models.found")}
              </p>
            )}
          </div>

          {/* =============================================================== */}
          {/* BANNER PREMIUM MODELS - Indicador de modelos no plano premium */}
          {/* =============================================================== */}
          <div className="bg-black pt-2 py-4 border-t border-b border-gray-700 flex justify-center">
            <div className="border-b-2 border-gray-900 pb-2 px-4">
              <span className="font-medium text-white">
                +3.000 Modelos no Premium
              </span>
            </div>
          </div>

          {/* =============================================================== */}
          {/* LISTA DE MODELOS - Cards das criadoras com fotos e informações */}
          {/* =============================================================== */}
          <div className="space-y-3 mb-8">
            {filteredModels.length > 0
              ? filteredModels.map((model, index) => (
                  <Card
                    key={index}
                    className="bg-gray-50 border-gray-200 overflow-hidden cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-[1.02]"
                    onClick={() => handleModelClick(model.id)}
                  >
                    <div className="relative h-20 flex items-center">
                      <div
                        className="absolute inset-0 bg-cover bg-center"
                        style={{ backgroundImage: `url(${model.bg})` }}
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-20"></div>
                      <div className="relative z-10 flex items-center gap-3 p-4 w-full">
                        <div className="relative">
                          <Image
                            src={model.image || "/placeholder.svg"}
                            alt={model.name}
                            width={68}
                            height={64}
                            className="rounded-full border-2 border-gray-300"
                          />
                          {model.verified && (
                            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                              <Check className="w-3 h-3 text-white" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-white">
                              {model.name}
                            </h3>
                            {model.verified && (
                              <Check className="w-4 h-4 text-blue-500" />
                            )}
                          </div>
                          <p className="text-white text-sm">{model.username}</p>
                        </div>
                        <ExternalLink className="w-5 h-5 text-white" />
                      </div>
                    </div>
                  </Card>
                ))
              : searchTerm &&
                !showHiddenProfile && (
                  /* Mensagem quando não há resultados na pesquisa */
                  <div className="text-center py-8 animate-in fade-in duration-500">
                    <div className="space-y-4">
                      <div className="flex flex-col items-center gap-3">
                        <div className="h-12 w-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center">
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
                            className="h-6 w-6 text-white"
                          >
                            <path
                              d="M2.062 12.348a1 1 0 0 1 0-.696 
                               10.75 10.75 0 0 1 19.876 0 
                               1 1 0 0 1 0 .696 
                               10.75 10.75 0 0 1-19.876 0"
                            ></path>
                            <circle cx="12" cy="12" r="3"></circle>
                          </svg>
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-white mb-1">
                            Encontramos perfis ocultos!
                          </h3>
                          <p className="text-sm text-gray-200">
                            Descobrimos conteúdos ocultos relacionados à sua
                            busca desta modelo!
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

            {/* =============================================================== */}
            {/* CARD PERFIL OCULTO - Mostra quando não há resultados e clica em desbloquear */}
            {/* =============================================================== */}
            <Dialog>
              <DialogTitle className="hidden">{t("want.more")}</DialogTitle>
              <DialogTrigger asChild>
                <button
                  className="flex items-center gap-4 px-12 py-3 
                                   bg-gradient-to-r from-orange-500 to-red-500 
                                   text-white font-medium rounded-full 
                                   hover:from-orange-600 hover:to-red-600 
                                   transition-all duration-200 hover:scale-105 
                                   shadow-lg"
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
                    className="h-4 w-4"
                  >
                    <path
                      d="M2.062 12.348a1 1 0 0 1 0-.696 
                             10.75 10.75 0 0 1 19.876 0 
                             1 1 0 0 1 0 .696 
                             10.75 10.75 0 0 1-19.876 0"
                    ></path>
                    <circle cx="12" cy="12" r="3"></circle>
                  </svg>
                  Desbloquear Todos os Perfis
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
                    className="h-4 w-4"
                  >
                    <path d="M15 3h6v6"></path>
                    <path d="M10 14 21 3"></path>
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                  </svg>
                </button>
              </DialogTrigger>
              <DialogContent className="p-0 max-w-sm w-full bg-gray-900 rounded-xl border-0 shadow-lg">
                <div className="relative overflow-hidden bg-gray-900 rounded-xl">
                  {/* Banner */}
                  <div className="relative h-32 w-full">
                    <div className="absolute inset-0 bg-gradient-to-br from-orange-600 via-red-500 to-pink-500 blur-[15px] brightness-75 scale-[1.2]"></div>
                    <div className="absolute inset-0 bg-black/40"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center text-white">
                        <svg
                          className="w-8 h-8 mx-auto mb-2 drop-shadow-lg"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          viewBox="0 0 24 24"
                        >
                          <rect
                            width="18"
                            height="11"
                            x="3"
                            y="11"
                            rx="2"
                            ry="2"
                          />
                          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                        </svg>
                        <p className="text-xs font-medium drop-shadow-lg">
                          Perfil Oculto
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Avatar */}
                  <div className="absolute top-24 left-6 z-10">
                    <div className="h-16 w-16 rounded-full border-4 border-white overflow-hidden relative">
                      <div
                        className="absolute inset-0 bg-cover bg-center blur-md brightness-75 scale-[1.1]"
                        style={{
                          backgroundImage:
                            "url('https://snewbnpytfvvjerythvw.supabase.co/storage/v1/object/public/model-images/profile_1748415578476_lb2fzagv_cropped_imagem_2025_05_28.jpg')",
                        }}
                      ></div>
                      <div className="absolute inset-0 bg-gradient-to-br from-orange-500/30 to-red-500/30"></div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <svg
                          className="w-6 h-6 text-white drop-shadow"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          viewBox="0 0 24 24"
                        >
                          <rect
                            width="18"
                            height="11"
                            x="3"
                            y="11"
                            rx="2"
                            ry="2"
                          />
                          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  {/* Conteúdo */}
                  <div className="pt-10 px-6 pb-6">
                    <div className="mb-4">
                      <div className="flex items-center gap-2 mb-1">
                        <h2 className="text-xl font-bold text-white capitalize">
                          {searchTerm}
                        </h2>
                        <svg
                          className="w-[18px] h-[18px] text-[#F58673]"
                          fill="currentColor"
                          viewBox="0 0 512 512"
                        >
                          <path d="M190.6 71.4C203 47.9 227.7 32 256 32s53 15.9 65.4 39.4c3.6 6.8 11.5 10.1 18.8 7.8c25.4-7.8 54.1-1.6 74.1 18.4s26.2 48.7 18.4 74.1c-2.3 7.3 1 15.2 7.8 18.8C464.1 203 480 227.7 480 256s-15.9 53-39.4 65.4c-6.8 3.6-10.1 11.5-7.8 18.8c7.8 25.4 1.6 54.1-18.4 74.1s-48.7 26.2-74.1 18.4c-7.3-2.3-15.2 1-18.8 7.8C309 464.1 284.3 480 256 480s-53-15.9-65.4-39.4c-3.6-6.8-11.5-10.1-18.8-7.8c-25.4 7.8-54.1 1.6-74.1-18.4s-26.2-48.7-18.4-74.1c2.3-7.3-1-15.2-7.8-18.8C47.9 309 32 284.3 32 256s15.9-53 39.4-65.4c6.8-3.6 10.1-11.5 7.8-18.8c-7.8-25.4-1.6-54.1 18.4-74.1s48.7-26.2 74.1-18.4c7.3 2.3 15.2-1 18.8-7.8zM363.3 203.3c6.2-6.2 6.2-16.4 0-22.6s-16.4-6.2-22.6 0L224 297.4l-52.7-52.7c-6.2-6.2-16.4-6.2-22.6 0s-6.2 16.4 0 22.6l64 64c6.2 6.2 16.4 6.2 22.6 0l128-128z" />
                        </svg>
                      </div>
                      <p className="text-sm text-gray-200 mb-3">
                        @{searchTerm.toLowerCase()}
                      </p>

                      <div className="bg-orange-900 border border-orange-600 rounded-lg p-4 text-sm text-orange-100">
                        <strong>Perfil Exclusivo Encontrado!</strong>
                        <br />
                        Encontramos um perfil oculto com{" "}
                        <strong>vários conteúdos</strong> relacionados ao termo
                        "<strong>{searchTerm}</strong>".
                        <br />
                        <strong>Este perfil contém conteudos exclusivos</strong>
                      </div>
                    </div>

                    {/* Botões */}
                    <div className="flex flex-col gap-2">
                      <button
                        onClick={() => router.push(getCheckoutUrl())}
                        className="flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white text-sm font-medium rounded-lg hover:scale-105 transition-all shadow-lg"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <circle cx="12" cy="12" r="10" />
                          <path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8" />
                          <path d="M12 18V6" />
                        </svg>
                        Desbloquear Todos os Perfis
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M15 3h6v6" />
                          <path d="M10 14 21 3" />
                          <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                        </svg>
                      </button>

                      <button
                        onClick={() => setShowHiddenProfile(false)}
                        className="px-4 py-2 text-sm text-gray-300 rounded-lg hover:bg-gray-800 transition"
                      >
                        Fechar
                      </button>
                    </div>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* =============================================================== */}
          {/* CARD PREMIUM FINAL - Última chamada para assinatura premium */}
          {/* =============================================================== */}
          <div className="mt-8 mb-6">
            <div className="rounded-lg border bg-card text-card-foreground overflow-hidden border-none bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 shadow-xl">
              <div className="relative p-6">
                {/* Background overlays */}
                <div className="absolute inset-0 opacity-10">
                  <div className="absolute inset-0 bg-gradient-to-br from-orange-500 to-red-500"></div>
                  <div
                    className="absolute inset-0"
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                    }}
                  ></div>
                </div>

                {/* Content */}
                <div className="relative z-10 text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-full mb-4 shadow-lg">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width={24}
                      height={24}
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-8 w-8 text-white"
                      aria-hidden="true"
                    >
                      <rect
                        width="18"
                        height="11"
                        x="3"
                        y="11"
                        rx="2"
                        ry="2"
                      ></rect>
                      <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                    </svg>
                  </div>

                  <h3 className="text-xl font-bold text-white mb-2">
                    Quer ver mais modelos?
                  </h3>

                  <p className="text-gray-200 text-sm mb-6 leading-relaxed max-w-sm mx-auto">
                    Para acessar <strong>milhares de modelos exclusivas</strong>{" "}
                    e <strong>mais de 100 mil mídias premium</strong>, assine
                    nosso plano completo!
                  </p>

                  <div className="grid grid-cols-2 gap-3 mb-6 text-xs max-w-sm mx-auto">
                    {[
                      "+3000 Modelos",
                      "+100 Mil Mídias",
                      "Perfis Ocultos",
                      "Acesso Ilimitado",
                    ].map((item) => (
                      <div
                        key={item}
                        className="flex items-center gap-2 text-gray-200"
                      >
                        <div className="w-2 h-2 bg-gradient-to-r from-orange-500 to-red-500 rounded-full"></div>
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={() => router.push(getCheckoutUrl())}
                    className="w-full inline-flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold rounded-xl hover:from-orange-600 hover:to-red-600 transition-all duration-200 hover:scale-105 shadow-lg hover:shadow-xl"
                    type="button"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width={24}
                      height={24}
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-5 w-5"
                      aria-hidden="true"
                    >
                      <circle cx="12" cy="12" r="10"></circle>
                      <path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8"></path>
                      <path d="M12 18V6"></path>
                    </svg>
                    Assinar Plano Premium
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width={24}
                      height={24}
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-4 w-4"
                      aria-hidden="true"
                    >
                      <path d="M15 3h6v6"></path>
                      <path d="M10 14 21 3"></path>
                      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                    </svg>
                  </button>

                  <p className="text-xs text-gray-400 mt-3">
                    30 dias de garantia • Acesso imediato
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* =============================================================== */}
        {/* MODAL DE SELEÇÃO DE IDIOMAS - Componente para trocar idioma */}
        {/* =============================================================== */}
        <LanguageModal
          isOpen={isLanguageModalOpen}
          onClose={() => setIsLanguageModalOpen(false)}
        />

        {/* =============================================================== */}
        {/* SCRIPTS ADICIONAIS - Clarity */}
        {/* =============================================================== */}
        <Script
          id="clarity-script"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
      (function(c,l,a,r,i,t,y){
          c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
          t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
          y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
      })(window, document, "clarity", "script", "rzscovlzzv");
    `,
          }}
        />
      </div>
    </>
  );
}
