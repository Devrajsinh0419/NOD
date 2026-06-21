export default function Marquee() {
  return (
    <div className="relative overflow-hidden bg-[#5A4A35] backdrop-blur-md py-6">

      <div className="marquee flex whitespace-nowrap">
        <span className="mx-10 text-5xl font-light uppercase tracking-[0.2em] text-[#F2ECE0]">
          Interior Design
        </span>

        <span className="mx-10 text-5xl font-light uppercase tracking-[0.2em] text-[#F2ECE0]">
          Architecture
        </span>

        <span className="mx-10 text-5xl font-light uppercase tracking-[0.2em] text-[#F2ECE0]">
          Modern Spaces
        </span>

        <span className="mx-10 text-5xl font-light uppercase tracking-[0.2em] text-[#F2ECE0]">
          Exterior
        </span>

        {/* Duplicate for smooth loop */}
        <span className="mx-10 text-5xl font-light uppercase tracking-[0.2em] text-[#F2ECE0]">
          Interior Design
        </span>

        <span className="mx-10 text-5xl font-light uppercase tracking-[0.2em] text-[#F2ECE0]">
          Architecture
        </span>

        <span className="mx-10 text-5xl font-light uppercase tracking-[0.2em] text-[#F2ECE0]">
          Modern Spaces
        </span>

        <span className="mx-10 text-5xl font-light uppercase tracking-[0.2em] text-[#F2ECE0]">
          Exterior
        </span>
      </div>

    </div>
  )
}