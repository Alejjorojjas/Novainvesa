import SEOHead from '../components/common/SEOHead'

const Section = ({ title, children }) => (
  <div className="mb-8">
    <h2 className="text-xl font-display font-bold text-neutral-800 mb-3">{title}</h2>
    <div className="text-neutral-600 leading-relaxed space-y-3">{children}</div>
  </div>
)

export default function PrivacyPage() {
  return (
    <>
      <SEOHead
        title="Política de Privacidad — Novainvesa"
        description="Conoce cómo Novainvesa recopila, usa y protege tu información personal conforme a la Ley 1581 de 2012."
      />

      <div className="max-w-3xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-display font-bold text-neutral-900 mb-2">
          Política de Privacidad
        </h1>
        <p className="text-neutral-500 text-sm mb-10">Última actualización: marzo de 2025</p>

        <Section title="1. Responsable del tratamiento">
          <p>
            <strong>Novainvesa</strong> es responsable del tratamiento de los datos personales que recopila
            a través de su sitio web <em>www.novainvesa.com</em>. Puede contactarnos en{' '}
            <a href="mailto:pedidos@novainvesa.com" className="text-[#2563EB] underline">
              pedidos@novainvesa.com
            </a>
            .
          </p>
        </Section>

        <Section title="2. Datos que recopilamos">
          <p>Recopilamos únicamente la información necesaria para gestionar tu pedido:</p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>Nombre completo y número de identificación</li>
            <li>Correo electrónico y número de teléfono</li>
            <li>Dirección de entrega (ciudad, departamento, dirección, barrio)</li>
            <li>Información de pago procesada por Wompi o MercadoPago (no almacenamos datos de tarjeta)</li>
            <li>Datos de navegación: páginas visitadas, productos vistos, dirección IP</li>
          </ul>
        </Section>

        <Section title="3. Finalidad del tratamiento">
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>Procesar y entregar tu pedido</li>
            <li>Enviarte confirmaciones y actualizaciones de estado</li>
            <li>Mejorar la experiencia de compra en el sitio</li>
            <li>Cumplir con obligaciones legales y tributarias</li>
            <li>Mostrarte publicidad relevante en Meta (Facebook/Instagram) con base en tu actividad</li>
          </ul>
        </Section>

        <Section title="4. Meta Pixel y seguimiento publicitario">
          <p>
            Utilizamos el <strong>Meta Pixel</strong> (Facebook Pixel) para medir la efectividad de
            nuestros anuncios y mostrarte publicidad personalizada. Este pixel recopila datos como páginas
            visitadas, productos vistos y compras realizadas.
          </p>
          <p>
            También utilizamos la <strong>API de Conversiones (CAPI)</strong> de Meta para enviar eventos
            de conversión directamente desde nuestros servidores, garantizando mayor precisión. La
            información de identificación personal (email, teléfono) se envía exclusivamente en formato
            hash SHA-256, de modo que Meta no recibe tus datos en texto plano.
          </p>
          <p>
            Puedes gestionar tus preferencias publicitarias en{' '}
            <a
              href="https://www.facebook.com/adpreferences"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#2563EB] underline"
            >
              facebook.com/adpreferences
            </a>
            .
          </p>
        </Section>

        <Section title="5. Cookies">
          <p>
            Usamos cookies propias para mantener tu sesión y preferencias (idioma, carrito de compras) y
            cookies de terceros de Meta para el seguimiento publicitario. Al continuar navegando en nuestro
            sitio, aceptas el uso de cookies conforme a esta política.
          </p>
        </Section>

        <Section title="6. Compartición de datos">
          <p>No vendemos ni alquilamos tus datos. Los compartimos únicamente con:</p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li><strong>Dropi:</strong> para gestionar el envío de tu pedido</li>
            <li><strong>Wompi / MercadoPago:</strong> para procesar pagos en línea</li>
            <li><strong>Meta Platforms:</strong> para seguimiento publicitario (datos hasheados)</li>
            <li><strong>Hostinger:</strong> proveedor de alojamiento web</li>
          </ul>
        </Section>

        <Section title="7. Tus derechos">
          <p>
            De conformidad con la Ley 1581 de 2012 (Colombia), tienes derecho a conocer, actualizar,
            rectificar y suprimir tus datos personales. Puedes ejercer estos derechos escribiéndonos a{' '}
            <a href="mailto:pedidos@novainvesa.com" className="text-[#2563EB] underline">
              pedidos@novainvesa.com
            </a>
            .
          </p>
        </Section>

        <Section title="8. Seguridad">
          <p>
            Implementamos medidas técnicas y organizativas para proteger tu información: conexiones HTTPS,
            cifrado de datos sensibles y acceso restringido a los sistemas de procesamiento.
          </p>
        </Section>

        <Section title="9. Cambios a esta política">
          <p>
            Podemos actualizar esta política periódicamente. La versión vigente siempre estará disponible
            en esta página con la fecha de última actualización.
          </p>
        </Section>
      </div>
    </>
  )
}
