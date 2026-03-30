import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

export default function ProductImages({ images = [], name = '' }) {
  const [active, setActive] = useState(0)

  if (!images.length) {
    return (
      <div className="aspect-square bg-neutral-100 rounded-2xl flex items-center justify-center">
        <span className="text-neutral-400 text-sm">Sin imagen</span>
      </div>
    )
  }

  function prev() {
    setActive(i => (i === 0 ? images.length - 1 : i - 1))
  }
  function next() {
    setActive(i => (i === images.length - 1 ? 0 : i + 1))
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Imagen principal */}
      <div className="relative aspect-square overflow-hidden bg-neutral-100 rounded-2xl">
        <img
          src={images[active]}
          alt={`${name} — imagen ${active + 1}`}
          className="w-full h-full object-cover"
          onError={e => { e.target.src = '/placeholder.jpg' }}
        />

        {/* Flechas si hay más de 1 imagen */}
        {images.length > 1 && (
          <>
            <button
              onClick={prev}
              aria-label="Imagen anterior"
              className="absolute left-2 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/80 hover:bg-white rounded-full flex items-center justify-center shadow transition-colors duration-200"
            >
              <ChevronLeft className="w-5 h-5 text-neutral-700" />
            </button>
            <button
              onClick={next}
              aria-label="Siguiente imagen"
              className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/80 hover:bg-white rounded-full flex items-center justify-center shadow transition-colors duration-200"
            >
              <ChevronRight className="w-5 h-5 text-neutral-700" />
            </button>
          </>
        )}

        {/* Indicador de posición */}
        {images.length > 1 && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
            {images.map((_, i) => (
              <button
                key={i}
                onClick={() => setActive(i)}
                aria-label={`Imagen ${i + 1}`}
                className={`w-2 h-2 rounded-full transition-colors duration-200 ${
                  i === active ? 'bg-[#2563EB]' : 'bg-white/60'
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Miniaturas */}
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {images.map((src, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              aria-label={`Ver imagen ${i + 1}`}
              className={`
                shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 transition-colors duration-200
                ${i === active ? 'border-[#2563EB]' : 'border-transparent hover:border-neutral-300'}
              `}
            >
              <img
                src={src}
                alt={`Miniatura ${i + 1}`}
                className="w-full h-full object-cover"
                loading="lazy"
                onError={e => { e.target.src = '/placeholder.jpg' }}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
