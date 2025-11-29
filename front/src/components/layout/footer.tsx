'use client'

import Link from 'next/link'
import { Instagram, Send } from 'lucide-react'
import { motion } from 'framer-motion'
import { Logo } from '@/components/ui/logo'

export function Footer() {
  return (
    <footer className="border-t border-fintage-graphite/20 dark:border-fintage-graphite/30 bg-fintage-offwhite dark:bg-fintage-charcoal bg-vintage-paper">
      <div className="container mx-auto px-6 md:px-8 lg:px-12 py-12 md:py-16">
        <div className="flex flex-col md:flex-row justify-between items-center gap-8 md:gap-12">
          <Logo
            variant="compact"
            showText={true}
            href="/"
            className="opacity-80 hover:opacity-100"
            aria-label="ROSEBOTANIQUE - на главную"
          />
          
          <div className="flex space-x-8 md:space-x-10">
            <a 
              href="https://t.me/rsbtnqstore"
              target="_blank"
              rel="noopener noreferrer"
              className="text-fintage-graphite dark:text-fintage-graphite/70 hover:text-accent transition-fintage group border border-transparent hover:border-hover-border dark:hover:border-hover-border p-2 rounded-sm"
              aria-label="написать в telegram"
            >
              <Send className="h-6 w-6 group-hover:scale-110 transition-fintage" />
            </a>
            <a 
              href="https://instagram.com/rosebotaniquestore"
              target="_blank"
              rel="noopener noreferrer"
              className="text-fintage-graphite dark:text-fintage-graphite/70 hover:text-accent transition-fintage group border border-transparent hover:border-hover-border dark:hover:border-hover-border p-2 rounded-sm"
              aria-label="подписаться в instagram"
            >
              <Instagram className="h-6 w-6 group-hover:scale-110 transition-fintage" />
            </a>
          </div>
        </div>

        <div className="border-t border-fintage-graphite/20 dark:border-fintage-graphite/30 mt-12 pt-8">
          <div className="flex flex-col items-center gap-3">
            <p className="text-fintage-graphite dark:text-fintage-graphite/50 text-[10px] font-mono tracking-[0.2em] uppercase">
              © 2024 ROSEBOTANIQUE STORE
            </p>
            
            {/* Технический индикатор - Stone Island стиль */}
            <motion.div
              className="group flex items-center gap-2 cursor-default"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
            >
              <div className="h-px w-8 bg-fintage-graphite/30 dark:bg-fintage-graphite/40 group-hover:bg-accent transition-fintage" />
              <p className="text-fintage-graphite/60 dark:text-fintage-graphite/40 text-[9px] font-mono tracking-[0.25em] uppercase group-hover:text-accent transition-fintage">
                made by M
              </p>
              <div className="h-px w-8 bg-fintage-graphite/30 dark:bg-fintage-graphite/40 group-hover:bg-accent transition-fintage" />
            </motion.div>
          </div>
        </div>
      </div>
    </footer>
  )
}

