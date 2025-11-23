import Link from 'next/link'
import { Instagram, Send } from 'lucide-react'

export function Footer() {
  return (
    <footer className="border-t border-fintage-graphite/20 dark:border-fintage-graphite/30 bg-fintage-offwhite dark:bg-fintage-charcoal bg-vintage-paper">
      <div className="container mx-auto px-6 md:px-8 lg:px-12 py-16 md:py-20">
        <div className="flex flex-col md:flex-row justify-between items-center gap-12">
          <h3 className="font-display-vintage text-lg md:text-xl font-black text-fintage-charcoal dark:text-fintage-offwhite tracking-tighter uppercase">
            ROSEBOTANIQUE
          </h3>
          
          <div className="flex space-x-8 md:space-x-10">
            <a 
              href="https://t.me/rosebotanique"
              target="_blank"
              rel="noopener noreferrer"
              className="text-fintage-graphite dark:text-fintage-graphite/70 hover:text-accent transition-fintage group border border-transparent hover:border-hover-border dark:hover:border-hover-border p-2 rounded-sm"
              aria-label="написать в telegram"
            >
              <Send className="h-5 w-5 group-hover:scale-110 transition-fintage" />
            </a>
            <a 
              href="https://instagram.com/rosebotanique.store"
              target="_blank"
              rel="noopener noreferrer"
              className="text-fintage-graphite dark:text-fintage-graphite/70 hover:text-accent transition-fintage group border border-transparent hover:border-hover-border dark:hover:border-hover-border p-2 rounded-sm"
              aria-label="подписаться в instagram"
            >
              <Instagram className="h-5 w-5 group-hover:scale-110 transition-fintage" />
            </a>
          </div>
        </div>

        <div className="border-t border-fintage-graphite/20 dark:border-fintage-graphite/30 mt-12 pt-8 text-center">
          <p className="text-fintage-graphite dark:text-fintage-graphite/50 text-[10px] font-mono tracking-[0.2em] uppercase">
            © 2024 ROSEBOTANIQUE STORE
          </p>
        </div>
      </div>
    </footer>
  )
}

