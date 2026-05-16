"use client";

import { motion } from "framer-motion";
import { SectionHeading } from "./ui/Cards";

const products = [
  {
    name: "Smart Soil Sensor Kit",
    category: "IoT Sensors",
    price: "₹4,999",
    originalPrice: "₹7,499",
    rating: 4.8,
    reviews: 342,
    badge: "Best Seller",
    icon: "🌱",
  },
  {
    name: "AI Drone Sprayer",
    category: "Precision Tools",
    price: "₹89,999",
    originalPrice: "₹1,24,999",
    rating: 4.9,
    reviews: 128,
    badge: "New",
    icon: "🚁",
  },
  {
    name: "BioFertilizer Pack",
    category: "Organic Inputs",
    price: "₹1,299",
    originalPrice: "₹1,999",
    rating: 4.7,
    reviews: 567,
    badge: "Organic",
    icon: "🌿",
  },
  {
    name: "Weather Station Pro",
    category: "Monitoring",
    price: "₹12,999",
    originalPrice: "₹18,999",
    rating: 4.6,
    reviews: 213,
    badge: "Pro",
    icon: "☀️",
  },
];

export default function CropShopSection() {

  const scrollToDetector = () => {
    document
      .getElementById("ai-detector")
      ?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section
      id="crop-shop"
      className="relative py-24 md:py-32 bg-black overflow-hidden"
    >

      {/* Background Glow */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-green-500/10 blur-3xl rounded-full" />

      <div className="absolute bottom-0 right-0 w-96 h-96 bg-green-400/10 blur-3xl rounded-full" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">

        <SectionHeading
          badge="Smart Crop Shop"
          title="Premium Agri"
          highlight="Marketplace"
          description="AI-powered farming tools, sensors, smart robotics, fertilizers, and futuristic agriculture systems."
        />

        {/* Products */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">

          {products.map((product, i) => (

            <motion.div
              key={product.name}
              initial={{ opacity: 0, y: 60 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              whileHover={{
                scale: 1.04,
                y: -8,
              }}
              className="relative bg-zinc-900/60 border border-green-500/20 rounded-3xl p-6 overflow-hidden backdrop-blur-xl hover:border-green-400 transition-all duration-300 group"
            >

              {/* Glow */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-all duration-500 bg-[radial-gradient(circle_at_center,rgba(34,197,94,0.18),transparent_70%)]" />

              {/* Badge */}
              <div className="absolute top-4 right-4">
                <span className="px-3 py-1 rounded-full text-[10px] uppercase tracking-widest bg-green-500/10 border border-green-500/20 text-green-400 font-bold">
                  {product.badge}
                </span>
              </div>

              {/* Icon */}
              <div className="text-5xl mb-5">
                {product.icon}
              </div>

              {/* Category */}
              <p className="text-xs uppercase tracking-[0.2em] text-zinc-500 mb-2">
                {product.category}
              </p>

              {/* Name */}
              <h3 className="text-lg font-bold text-white mb-3">
                {product.name}
              </h3>

              {/* Rating */}
              <div className="flex items-center gap-2 mb-4">
                <span className="text-yellow-400">
                  ⭐ {product.rating}
                </span>

                <span className="text-zinc-500 text-sm">
                  ({product.reviews})
                </span>
              </div>

              {/* Price */}
              <div className="flex items-center gap-3 mb-5">
                <span className="text-2xl font-bold text-green-400">
                  {product.price}
                </span>

                <span className="line-through text-zinc-500 text-sm">
                  {product.originalPrice}
                </span>
              </div>

              {/* Buttons */}
              <div className="flex flex-col gap-3">

                <button
                  className="w-full py-3 rounded-2xl bg-green-500 text-black font-bold hover:bg-green-400 transition-all duration-300 shadow-[0_0_25px_rgba(34,197,94,0.4)]"
                >
                  Add to Cart
                </button>

                <button
                  onClick={scrollToDetector}
                  className="w-full py-3 rounded-2xl border border-green-500/30 text-green-400 hover:bg-green-500/10 transition-all duration-300"
                >
                  Detect Crop Disease
                </button>

              </div>

            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="mt-16 rounded-3xl border border-green-500/20 bg-zinc-900/50 backdrop-blur-xl p-10 text-center relative overflow-hidden"
        >

          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(34,197,94,0.1),transparent_70%)]" />

          <h3 className="text-3xl font-black text-white mb-4">
            Upgrade Your Farm With
            <span className="text-green-400"> AI Technology</span>
          </h3>

          <p className="text-zinc-400 max-w-2xl mx-auto mb-8">
            Trusted by thousands of farmers using AI disease detection,
            robotics, weather analytics, and smart agriculture systems.
          </p>

          <div className="flex flex-col md:flex-row justify-center gap-4">

            <button
              onClick={scrollToDetector}
              className="px-8 py-4 rounded-2xl bg-green-500 text-black font-bold hover:bg-green-400 transition-all duration-300 shadow-[0_0_30px_rgba(34,197,94,0.5)]"
            >
              Launch AI Detector
            </button>

            <button
              className="px-8 py-4 rounded-2xl border border-green-500/30 text-green-400 hover:bg-green-500/10 transition-all duration-300"
            >
              Browse Marketplace
            </button>

          </div>

        </motion.div>
      </div>
    </section>
  );
}
