"use client"

import Image from "next/image"

export default function AboutFounder() {
  return (
    <section id="about" className="px-6 py-24">

      {/* TOP LINE */}
      <div className="mb-6 h-px w-full bg-[#C9A96E]/10" />

      {/* SECTION TITLE */}
      <div className="mb-10 text-center">

        <p className="text-sm uppercase tracking-[0.3em] text-[#C9A96E]">
          About
        </p>

      </div>

      {/* CARD */}
      <div className="mx-auto max-w-5xl rounded-[1.5rem] border border-[#C9A96E]/10 bg-[#1A1714] p-8 backdrop-blur-xl">

        <div className="flex flex-col gap-8 md:flex-row md:items-center">

          {/* IMAGE */}
          <div className="relative h-70 w-55 overflow-hidden rounded-[1rem]">

            <Image
              src="/images/founder.png"
              alt="Founder"
              fill
              className="object-cover"
            />

          </div>

          {/* CONTENT */}
          <div className="max-w-2xl">

            <h2 className="text-4xl font-light text-[#F5F0E8]">
              Govind Shukla
            </h2>

            <p className="mt-1 text-sm text-[#C9A96E]">
              Founder
            </p>

            <p className="mt-8 text-lg leading-relaxed text-[#B8A88A]">
              “Nothing of true value comes free. We build spaces
              through precision, dedication, and timeless craftsmanship.”
            </p>

          </div>

        </div>

      </div>

    </section>
  )
}