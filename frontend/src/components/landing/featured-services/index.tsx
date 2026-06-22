"use client"

import Link from "next/dist/client/link";
import Image from "next/image"

export default function DesignsSection() {

  const sections = [
    {
      title: "DESIGNS",
      quote:
        "Modern architectural and interior solutions crafted for timeless living.",

      cards: [
        {
          title: "Interior",
          image: "/images/interior.png",
        },
        {
          title: "Exterior",
          image: "/images/exterior.png",
        },
        {
          title: "2D/3D",
          image: "/images/floorplan.png",
        },
      ],
    },

    {
      title: "CONSTRUCTION",
      quote:
        "Precision-driven construction services built with quality, efficiency, and durability.",

      cards: [
        {
          title: "Renovation",
          image: "/images/reno.png",
        },
        {
          title: "Civil Construction",
          image: "/images/civil.png",
        },
        {
          title: "Structural Planning",
          image: "/images/structure.png",
        },
      ],
    },

    {
      title: "PLANNING",
      quote:
        "Technical planning and drafting solutions designed for accurate execution and harmony.",

      cards: [
        {
          title: "AutoCAD Drafting",
          image: "/images/autocad.png",
        },
        {
          title: "Vastu Consultation",
          image: "/images/vastu.png",
        },
        {
          title: "Project Planning",
          image: "/images/project.png",
        },
      ],
    },
  ]

  return (
    <div id="services" className="space-y-6 md:space-y-10 p-4 md:p-10">

      {sections.map((section, index) => (

        <div
          key={index}
          className="group mx-auto max-w-6xl rounded-[1.5rem] md:rounded-[2rem] bg-[#1A1714] border border-[#C9A96E]/8 p-4 md:p-8 transition-all duration-500 hover:border-[#C9A96E]/15"
        >

          {/* TOP SECTION */}
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between rounded-[1rem] md:rounded-[1.5rem] bg-[#221F1A] px-6 py-6 md:px-10 md:py-6 text-center md:text-left">

            <h2 className="text-2xl md:text-5xl tracking-[0.15em] text-[#C9A96E]">
              {section.title}
            </h2>

            <p className="max-w-md text-sm md:text-lg text-[#8B7355]">
              {section.quote}
            </p>

          </div>

          {/* DROPDOWN WRAPPER */}
          <div className="overflow-hidden transition-all duration-700 max-h-0 group-hover:max-h-[1000px]">

            {/* CARDS */}
            <Link href="/login?mode=signup" className="col-span-3">
              <div className="mt-6 md:mt-8 grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
              
              {section.cards.map((card, i) => (

                <div
                  key={i}
                  className="group/card relative cursor-pointer overflow-hidden rounded-[1.5rem]"
                >

                  {/* IMAGE */}
                  <Image
                    src={card.image}
                    alt={card.title}
                    width={400}
                    height={300}
                    className="h-48 md:h-72 w-full object-cover transition-all duration-500 group-hover/card:scale-110"
                  />

                  {/* DARK OVERLAY */}
                  <div className="absolute inset-0 bg-black/20 transition-all duration-500 group-hover/card:bg-black/50" />

                  {/* TEXT */}
                  <div className="absolute inset-0 flex items-center justify-center">

                    <h3 className="translate-y-6 md:translate-y-10 text-xl md:text-4xl font-light text-white opacity-0 transition-all duration-500 group-hover/card:translate-y-0 group-hover/card:opacity-100">
                      {card.title}
                    </h3>

                  </div>

                </div>

              ))}
              
            </div>
            </Link>

          </div>

        </div>

      ))}

    </div>
  )
}