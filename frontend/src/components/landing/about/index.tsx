"use client"

import Image from "next/image"

export default function AboutFounder() {
  return (
    <section id="about" className="px-4 md:px-6 py-12 md:py-24">

      {/* TOP LINE */}
      <div className="mb-6 h-px w-full bg-[#C9A96E]/10" />

      {/* SECTION TITLE */}
      <div className="mb-10 text-center">

        <p className="text-sm uppercase tracking-[0.3em] text-[#C9A96E]">
          About
        </p>

      </div>

      {/* CARD */}
      <div className="mx-auto max-w-5xl rounded-[1.5rem] border border-[#C9A96E]/10 bg-[#1A1714] p-6 md:p-8 backdrop-blur-xl">

        <div className="flex flex-col gap-8 md:flex-row md:items-center">

          {/* IMAGE */}
          <div className="relative h-80 w-64 md:h-96 md:w-72 overflow-hidden rounded-[1rem] mx-auto md:mx-0 shrink-0">

            <Image
              src="/images/founder.webp"
              alt="Govind Shukla - Founder of Night Owl Designers (NOD)"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 300px"
              loading="lazy"
            />

          </div>

          {/* CONTENT */}
          <div className="max-w-2xl text-center md:text-left">

            <h2 className="text-3xl md:text-4xl font-light text-[#F5F0E8]">
              Govind Shukla
            </h2>

            <p className="mt-1 text-sm text-[#C9A96E]">
              Founder
            </p>

            <p className="mt-6 md:mt-8 text-base md:text-lg leading-relaxed text-[#B8A88A]">
              “Nothing of true value comes free. We build spaces
              through precision, dedication, and timeless craftsmanship.”
            </p>

          </div>

        </div>

      </div>

    </section>
  )
}