import Link from "next/link";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Script from "next/script";

export default function PresellPage() {
  return (
    <>
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

      {/* Meta Pixel Code */}
      <Script id="meta-pixel" strategy="afterInteractive">
        {`
          !function(f,b,e,v,n,t,s)
          {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
          n.callMethod.apply(n,arguments):n.queue.push(arguments)};
          if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
          n.queue=[];t=b.createElement(e);t.async=!0;
          t.src=v;s=b.getElementsByTagName(e)[0];
          s.parentNode.insertBefore(t,s)}(window, document,'script',
          'https://connect.facebook.net/en_US/fbevents.js');
          fbq('init', '1207117403912525');
          fbq('track', 'PageView');
        `}
      </Script>
      <noscript>
        <img
          height="1"
          width="1"
          style={{ display: "none" }}
          src="https://www.facebook.com/tr?id=1207117403912525&ev=PageView&noscript=1"
        />
      </noscript>

      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
        <div className="max-w-2xl mx-auto text-center space-y-8">
          {/* Logo/Brand */}
          <div className="space-y-4">
            <div className="flex items-center justify-center gap-3">
              <Image
                alt="PrivacyClub Icon"
                width={48}
                height={48}
                src="./logoSVGteste.svg"
                className="object-contain"
              />
              <h1 className="text-4xl md:text-6xl font-bold text-slate-900 tracking-tight italic font-['Poppins',sans-serif]">
                PrivacyClub
              </h1>
            </div>
            <p className="text-slate-600 text-lg md:text-xl">
              A melhor experiência em conteúdo premium do Brasil
            </p>
          </div>

          {/* Main Content */}
          <div className="space-y-6">
            <h2 className="text-2xl md:text-3xl font-semibold text-slate-800">
              Descubra mais de 3 mil modelos exclusivas
            </h2>
            <p className="text-slate-600 max-w-lg mx-auto leading-relaxed">
              Mais de 100 mil mídias premium te esperando.
            </p>

            {/* Features preview */}
            <div className="grid grid-cols-2 gap-4 max-w-md mx-auto text-sm">
              <div className="flex items-center gap-2 text-slate-700">
                <div className="w-2 h-2 bg-gradient-to-r from-orange-500 to-red-500 rounded-full"></div>
                <span>+3.000 Modelos</span>
              </div>
              <div className="flex items-center gap-2 text-slate-700">
                <div className="w-2 h-2 bg-gradient-to-r from-orange-500 to-red-500 rounded-full"></div>
                <span>+100 Mil Mídias</span>
              </div>
              <div className="flex items-center gap-2 text-slate-700">
                <div className="w-2 h-2 bg-gradient-to-r from-orange-500 to-red-500 rounded-full"></div>
                <span>Perfis Verificados</span>
              </div>
              <div className="flex items-center gap-2 text-slate-700">
                <div className="w-2 h-2 bg-gradient-to-r from-orange-500 to-red-500 rounded-full"></div>
                <span>Acesso Imediato</span>
              </div>
            </div>
          </div>

          {/* CTA Button */}
          <div className="pt-4 space-y-4">
            <Link href="/inicio">
              <Button
                size="lg"
                className="px-12 py-4 text-lg font-medium bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
              >
                🔥 Entrar Agora
              </Button>
            </Link>

            {/* Guarantee badge */}
            <div className="bg-green-50 border border-green-200 rounded-full px-4 py-2 inline-block">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full flex items-center justify-center">
                  <svg
                    className="h-2 w-2 text-white"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"></path>
                  </svg>
                </div>
                <span className="text-xs font-medium text-green-700">
                  30 dias de garantia • Reembolso total
                </span>
              </div>
            </div>
          </div>

          {/* Subtle accent */}
          <div className="pt-8">
            <div className="w-16 h-1 bg-slate-300 mx-auto rounded-full"></div>
          </div>
        </div>
      </div>
    </>
  );
}
