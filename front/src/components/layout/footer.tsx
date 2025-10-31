import Link from 'next/link'
import { Instagram, Send } from 'lucide-react'

export function Footer() {
  return (
    <footer className="border-t border-mistGray/30 bg-white">
      <div className="container mx-auto px-6 md:px-12 lg:px-24 py-16">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <h3 className="text-graceful text-xl font-light text-inkSoft mb-8 md:mb-0">
            rosebotanique store
          </h3>
          
          <div className="flex space-x-8">
            <a 
              href="https://t.me/rosebotanique"
              target="_blank"
              rel="noopener noreferrer"
              className="text-whisper hover:text-sageTint transition-colors duration-500 ease-out group"
              aria-label="Contact us on Telegram"
            >
              <Send className="h-5 w-5 group-hover:scale-110 transition-transform duration-300" />
            </a>
            <a 
              href="https://instagram.com/rosebotanique.store"
              target="_blank"
              rel="noopener noreferrer"
              className="text-whisper hover:text-sageTint transition-colors duration-500 ease-out group"
              aria-label="Follow us on Instagram"
            >
              <Instagram className="h-5 w-5 group-hover:scale-110 transition-transform duration-300" />
            </a>
          </div>
        </div>

        <div className="border-t border-mistGray/30 mt-8 pt-8 text-center">
          <p className="text-whisper text-sm font-light">
            © 2024 rosebotanique store
          </p>
        </div>
      </div>
    </footer>
  )
}

