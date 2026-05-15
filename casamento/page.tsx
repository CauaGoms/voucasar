"use client";

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { Cormorant_Garamond, Montserrat, WindSong } from 'next/font/google';
import casalImage from '../img_casal.jpeg';
import logoImage from '../logo_la.jpg';
import noivosImage from '../img_noivos.png';

const sections = [
  { label: 'Lista de Presentes', href: '/lista-presentes' },
  { label: 'Confirmar Presença', href: '/confirmar-presenca' },
  { label: 'Cerimônia', href: '/cerimonia' },
  { label: 'Recepção', href: '/recepcao' },
] as const;

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-cormorant',
});

const montserrat = Montserrat({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-montserrat',
});
const script = WindSong({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-script',
});

const targetDate = new Date('2026-08-29T15:30:00-03:00');

const formatTwoDigits = (value: number) => String(value).padStart(2, '0');

const getCountdownParts = () => {
  const now = Date.now();
  const diff = targetDate.getTime() - now;

  if (diff <= 0) {
    return {
      days: '0',
      hours: '00',
      minutes: '00',
      seconds: '00',
      isEventDay: true,
    };
  }

  const totalSeconds = Math.floor(diff / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return {
    days: String(days),
    hours: formatTwoDigits(hours),
    minutes: formatTwoDigits(minutes),
    seconds: formatTwoDigits(seconds),
    isEventDay: false,
  };
};

export default function HomePage() {
  const [countdown, setCountdown] = useState(getCountdownParts);
  const [isNavOpen, setIsNavOpen] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(getCountdownParts());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsNavOpen(false);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <main className={`wedding-page ${cormorant.variable} ${montserrat.variable} ${script.variable}`}>
      <div className="floating-logo">
        <button
          type="button"
          className="floating-logo__button"
          onClick={() => setIsNavOpen((prev) => !prev)}
          aria-expanded={isNavOpen}
          aria-controls="top-nav"
        >
          <Image
            src={logoImage}
            alt="Abrir menu"
            className="floating-logo__image"
          />
        </button>
      </div>

      <nav id="top-nav" className={`top-nav ${isNavOpen ? 'top-nav--open' : ''}`} aria-label="Navegação principal">
        <div className="top-nav__inner">
          {sections.map((section) => (
            <a key={section.href} href={section.href} className="top-nav__link">
              {section.label}
            </a>
          ))}
        </div>
      </nav>

      <section className="hero hero--minimal">
        <figure className="hero__image-wrap hero__image-wrap--casal hero__image-wrap--casal-overlay" aria-label="Casamento">
          <div className="hero__image-frame">
            <Image
              src={casalImage}
              alt="Casamento"
              className="hero__image hero__image--casal"
              priority
            />
            <div className="hero__image-caption" aria-hidden="true">
              <div className="hero__image-caption-content">
                <span className="hero__image-caption-names">Lais &amp; Antônio</span>
              </div>
            </div>
          </div>
        </figure>

        <div className="hero__content hero__content--minimal">
          <div className="hero__details">
            <div className="hero__countdown" aria-label="Contagem regressiva para o casamento">
              <p className="hero__countdown-label">Contagem regressiva</p>
              {countdown.isEventDay ? (
                <p className="hero__countdown-celebrate" aria-live="polite">Chegou o grande dia!</p>
              ) : (
                <div className="hero__countdown-grid" aria-live="polite">
                  <div className="hero__countdown-card">
                    <span className="hero__countdown-number">{countdown.days}</span>
                    <span className="hero__countdown-unit">Dias</span>
                  </div>
                  <div className="hero__countdown-card">
                    <span className="hero__countdown-number">{countdown.hours}</span>
                    <span className="hero__countdown-unit">Horas</span>
                  </div>
                  <div className="hero__countdown-card">
                    <span className="hero__countdown-number">{countdown.minutes}</span>
                    <span className="hero__countdown-unit">Min</span>
                  </div>
                  <div className="hero__countdown-card">
                    <span className="hero__countdown-number">{countdown.seconds}</span>
                    <span className="hero__countdown-unit">Seg</span>
                  </div>
                </div>
              )}
            </div>

            <span className="hero__divider" aria-hidden="true" />

            <p className="hero__kicker">Save the Date</p>
            <p className="lead lead--date">29 de Agosto de 2026 às 15h30</p>

            <h1 className="couple-stack__names">
              Lais <span aria-hidden="true" className="couple-stack__amp">&amp;</span> Antônio
            </h1>
            <span className="couple-stack__line" aria-hidden="true" />
          </div>

          <nav className="section-nav" aria-label="Seções do casamento">
            <p className="section-nav__label">Navegue pelo evento</p>
            {sections.map((section) => (
              <a key={section.href} href={section.href} className="section-nav__button">
                {section.label}
              </a>
            ))}
          </nav>

          <div className="classic-divider" aria-hidden="true" />

          <figure className="hero__image-wrap hero__image-wrap--noivos" aria-label="Foto dos noivos">
            <Image
              src={noivosImage}
              alt="Foto dos noivos"
              className="hero__image"
            />
          </figure>
            <p className="intro-text">Há 10 anos, o destino nos apresentou, mas foi o tempo que transformou esse encontro em algo raro: um amor construído na admiração, na parceria e na escolha diária de caminhar juntos.</p>

            <p className="intro-text">Nossa história nunca foi feita apenas de grandes momentos, mas principalmente dos detalhes silenciosos que sustentam um relacionamento verdadeiro: o incentivo nos dias difíceis, a presença constante.</p>

            <p className="intro-text">O Antônio, em cada conquista minha, existe um pouco do amor dele, da paciência dele e da forma generosa com que sempre segurou minha mão sem nunca tentar limitar meus sonhos.</p>

            <p className="intro-text">E talvez seja isso que mais define o nosso amor: crescemos juntos, sem deixar de sermos nós mesmos.</p>

            <div className="classic-divider" aria-hidden="true" />

            <p className="intro-text">Na Laís,  eu encontrei meu porto seguro, um amor leve, maduro e verdadeiro, daqueles que acolhem, fortalecem e permanecem.</p>

            <p className="intro-text">Depois de uma década compartilhando a vida, entendemos que o amor não está apenas nas promessas bonitas, mas na presença diária, na parceria constante e na certeza de que nenhum sonho parece impossível quando temos a pessoa certa ao nosso lado.</p>

            <p className="intro-text">Escolhermos celebrar não apenas o amor que sentimos, mas toda a trajetória que nos trouxe até aqui. Cada desafio superado, cada conquista compartilhada, cada recomeço vivido lado a lado.</p>

            <p className="intro-highlight">Esse casamento é a continuação da história mais bonita que já escrevemos: a nossa.</p>

            <p className="intro-text">E não poderíamos imaginar esse novo capítulo sem dividir esse momento com as pessoas que fazem parte da nossa vida.</p>

            <p className="intro-text">Sejam bem-vindos ao início do nosso para sempre.</p>

            <div className="signature">
              <Image
                src={logoImage}
                alt="Logo Lais e Antonio"
                className="signature__logo"
              />
            </div>

            <footer className="classic-footer">Obrigado por fazer parte do nosso dia</footer>
        </div>
      </section>

    </main>
  );
}