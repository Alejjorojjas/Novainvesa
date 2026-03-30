import SEOHead from '../components/common/SEOHead'

const Section = ({ title, children }) => (
  <div className="mb-8">
    <h2 className="text-xl font-display font-bold text-neutral-800 mb-3">{title}</h2>
    <div className="text-neutral-600 leading-relaxed space-y-3">{children}</div>
  </div>
)

export default function TermsPage() {
  return (
    <>
      <SEOHead
        title="Términos y Condiciones — Novainvesa"
        description="Lee los términos y condiciones de compra en Novainvesa: envíos, devoluciones, pagos y garantías."
      />

      <div className="max-w-3xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-display font-bold text-neutral-900 mb-2">
          Términos y Condiciones
        </h1>
        <p className="text-neutral-500 text-sm mb-10">Última actualización: marzo de 2025</p>

        <Section title="1. Aceptación">
          <p>
            Al realizar una compra en <strong>www.novainvesa.com</strong> aceptas estos términos y
            condiciones en su totalidad. Si no estás de acuerdo, te pedimos que no realices ninguna compra.
          </p>
        </Section>

        <Section title="2. Productos y precios">
          <p>
            Todos los precios están expresados en <strong>pesos colombianos (COP)</strong> e incluyen IVA
            cuando aplica. Nos reservamos el derecho de modificar precios sin previo aviso. El precio
            válido es el mostrado en el momento de confirmar el pedido.
          </p>
          <p>
            Las imágenes de los productos son ilustrativas; el producto real puede diferir levemente en
            color o presentación dependiendo del proveedor.
          </p>
        </Section>

        <Section title="3. Proceso de pedido">
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>Agrega los productos al carrito y procede al checkout.</li>
            <li>Completa el formulario con tus datos de contacto y entrega.</li>
            <li>Selecciona el método de pago: Contra Entrega (COD), Wompi o MercadoPago.</li>
            <li>Recibirás un correo de confirmación con el código de tu pedido (formato NOVA-YYYYMMDD-NNNN).</li>
            <li>El pedido se procesa con nuestro proveedor logístico una vez confirmado el pago.</li>
          </ul>
        </Section>

        <Section title="4. Pago contra entrega (COD)">
          <p>
            El pago contra entrega está disponible en ciudades cubiertas por nuestra red logística y para
            pedidos con valor total inferior a <strong>$500.000 COP</strong>. El cobro se realiza en
            efectivo al momento de la entrega. Si no hay nadie para recibir el paquete en el tercer intento
            de entrega, el pedido será devuelto y podrán aplicarse cargos de reenvío.
          </p>
        </Section>

        <Section title="5. Pagos en línea">
          <p>
            Los pagos en línea son procesados por <strong>Wompi</strong> (Bancolombia) y{' '}
            <strong>MercadoPago</strong>, plataformas certificadas PCI-DSS. Novainvesa no almacena datos
            de tarjeta ni credenciales bancarias. En caso de pago rechazado, el pedido no se crea y no se
            realiza ningún cobro.
          </p>
        </Section>

        <Section title="6. Envíos y tiempos de entrega">
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>Despacho en 24 horas hábiles después de la confirmación del pedido.</li>
            <li>Ciudades principales (Bogotá, Medellín, Cali, Barranquilla): 2–4 días hábiles.</li>
            <li>Otras ciudades con cobertura: 4–7 días hábiles.</li>
            <li>Los tiempos son estimados y pueden variar por causas externas (festivos, eventos climáticos).</li>
          </ul>
        </Section>

        <Section title="7. Devoluciones y garantías">
          <p>
            Aceptamos devoluciones dentro de los <strong>7 días calendario</strong> siguientes a la
            recepción del producto, siempre que:
          </p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>El producto esté en su empaque original sin uso.</li>
            <li>Se adjunte el número de pedido.</li>
            <li>El motivo sea defecto de fábrica, producto incorrecto o daño en el transporte.</li>
          </ul>
          <p>
            Para iniciar una devolución contáctanos por WhatsApp o al correo{' '}
            <a href="mailto:pedidos@novainvesa.com" className="text-[#2563EB] underline">
              pedidos@novainvesa.com
            </a>
            .
          </p>
        </Section>

        <Section title="8. Limitación de responsabilidad">
          <p>
            Novainvesa actúa como intermediario entre el cliente y el proveedor logístico. No somos
            responsables por demoras causadas por terceros, desastres naturales, huelgas u otras causas
            de fuerza mayor.
          </p>
        </Section>

        <Section title="9. Modificaciones">
          <p>
            Podemos actualizar estos términos en cualquier momento. La versión vigente estará siempre
            disponible en esta página.
          </p>
        </Section>

        <Section title="10. Ley aplicable">
          <p>
            Estos términos se rigen por las leyes de la República de Colombia. Cualquier disputa será
            resuelta ante los jueces competentes de Bogotá D.C.
          </p>
        </Section>
      </div>
    </>
  )
}
