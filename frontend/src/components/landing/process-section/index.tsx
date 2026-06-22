"use client"

const steps = [
  {
    number: "01",
    title: "Consultation",
    description:
      "Understanding your vision and project requirements",
  },

  {
    number: "02",
    title: "Planning",
    description:
      "Crafting layout and architectural direction",
  },

  {
    number: "03",
    title: "Design",
    description:
      "Creating modern and functional spaces",
  },

  {
    number: "04",
    title: "Execution",
    description:
      "Delivering precise and high-quality results",
  },
]

export default function ProcessSection() {
  return (
    <section className="px-4 md:px-6 py-12 md:py-24">

      {/* TOP LINE */}
      <div className="mb-6 h-px w-full bg-[#C9A96E]/10" />

      <div className="mx-auto max-w-6xl">

        {/* HEADING */}
        <div className="mb-16 text-center">

          <p className="mb-4 text-sm uppercase tracking-[0.3em] text-[#C9A96E]">
            How We Work
          </p>

          <h2 className="text-3xl md:text-5xl font-light text-[#F5F0E8] leading-tight">
            From Concept to Completion
          </h2>

        </div>

        {/* STEPS */}
        <div className="grid gap-6 md:grid-cols-4">

          {steps.map((step, index) => (

            <div
              key={index}
              className="rounded-[1.5rem] border border-[#C9A96E]/10 bg-[#1A1714] p-6 md:p-8 transition-all duration-500 hover:border-[#C9A96E]/20 hover:bg-[#221F1A]"
            >

              {/* NUMBER */}
              <p className="mb-6 text-6xl font-light text-[#5A4A35]">
                {step.number}
              </p>

              {/* TITLE */}
              <h3 className="mb-4 text-2xl font-light text-[#F5F0E8]">
                {step.title}
              </h3>

              {/* DESCRIPTION */}
              <p className="text-sm leading-relaxed text-[#8B7355]">
                {step.description}
              </p>

            </div>

          ))}

        </div>

      </div>

    </section>
  )
}