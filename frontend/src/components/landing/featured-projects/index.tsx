"use client"

import Image from "next/image"

const projects = [
  {
    image: "/images/p1.webp",
    title: "Modern Villa",
    category: "Interior Design",
    className: "md:col-span-2 md:row-span-1",
  },

  {
    image: "/images/p2.webp",
    title: "Serene Living",
    category: "Luxury Interior",
    className: "md:col-span-1 md:row-span-1",
  },

  {
    image: "/images/p3.webp",
    title: "Urban Residence",
    category: "Exterior Design",
    className: "md:col-span-2 md:row-span-1",
  },

  {
    image: "/images/p4.webp",
    title: "Ambient Lounge",
    category: "Interior Space",
    className: "md:col-span-1 md:row-span-1",
  },

  {
    image: "/images/p5.webp",
    title: "Skyline Apartment",
    category: "Modern Living",
    className: "md:col-span-3 md:row-span-1",
  },
]

export default function FeaturedProjects() {
  return (
    <section id="projects" className="px-4 md:px-6 py-12 md:py-24">

      {/* TOP LINE */}
      <div className="mb-6 h-px w-full bg-[#C9A96E]/10" />

      <div className="mx-auto max-w-6xl">

        {/* HEADING */}
        <div className="mb-12 text-center">

          <p className="mb-4 text-sm uppercase tracking-[0.3em] text-[#C9A96E]">
            Featured Work
          </p>

          <h2 className="text-3xl md:text-5xl font-light text-[#F5F0E8] leading-tight">
            Selected Projects Across India
          </h2>

          <p className="mx-auto mt-4 max-w-2xl text-[#8B7355]">
            Luxury architectural and interior projects crafted
            with precision and modern aesthetics.
          </p>

        </div>

        {/* GRID */}
        <div className="grid auto-rows-[300px] gap-6 md:grid-cols-3">

          {projects.map((project, index) => (

            <div
              key={index}
              className={`static-dark group relative overflow-hidden rounded-[2rem] ${project.className}`}
            >

              {/* IMAGE */}
              <Image
                src={project.image}
                alt={project.title}
                fill
                className="object-cover transition-all duration-700 group-hover:scale-105"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 400px"
                loading="lazy"
              />

              {/* OVERLAY */}
              <div className="absolute inset-0 bg-black/20 transition-all duration-500 group-hover:bg-black/40" />

              {/* TEXT */}
              <div className="absolute bottom-6 right-6 z-10 text-right">

                <h3 className="text-2xl font-light text-[#F5F0E8]">
                  {project.title}
                </h3>

                <p className="text-sm text-[#C9A96E]/80">
                  {project.category}
                </p>

              </div>

            </div>

          ))}

        </div>

      </div>

    </section>
  )
}