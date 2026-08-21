import { ArrowRight, Globe2, Mail, MapPin, Phone } from 'lucide-react';
import { motion } from 'motion/react';
import { mediaUrl } from '../src/api';
import DecryptedText from './DecryptedText';
import { fadeLeft, fadeRight, smoothTransition, viewportReplay } from './animationPresets';

function getSocialMark(type = '', label = '') {
  const key = `${type} ${label}`.toLowerCase();
  if (key.includes('github')) return 'GH';
  if (key.includes('linked')) return 'in';
  if (key.includes('whatsapp')) return 'WA';
  if (key.includes('fiverr')) return 'fi';
  return 'SK';
}

export default function Contact({ data }) {
  const contact = data?.contact;
  if (!contact) return null;
  const copyright = data?.settings?.footerCopyright || 'Sandaru Kaushan. All rights reserved.';
  const socialLinks = Array.from(
    new Map(
      (contact.socialLinks || [])
        .filter((link) => link?.label && link?.url)
        .map((link) => [`${link.label.trim().toLowerCase()}|${link.url.trim().toLowerCase()}`, link])
    ).values()
  );

  return (
    <footer className="contact-section" id="contact">
      <div className="contact-grid">
        <motion.div
          className="contact-left"
          variants={fadeLeft}
          initial="hidden"
          whileInView="show"
          transition={smoothTransition}
          viewport={viewportReplay}
        >
          <h2 className="contact-heading-wrap">
            <DecryptedText
              text={contact.heading}
              animateOn="view"
              sequential
              revealDirection="center"
              speed={34}
              characters="ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789/.-_"
              parentClassName="decrypted-heading"
              className="decrypted-heading-char"
              encryptedClassName="decrypted-heading-char encrypted"
            />
          </h2>
          <p className="contact-desc">{contact.description}</p>
          <a href={`mailto:${contact.email}`} className="contact-cta-btn">
            {contact.cta} <ArrowRight size={16} strokeWidth={1.8} aria-hidden="true" />
          </a>
        </motion.div>

        <motion.div
          className="contact-info"
          variants={fadeRight}
          initial="hidden"
          whileInView="show"
          transition={{ ...smoothTransition, delay: 0.08 }}
          viewport={viewportReplay}
        >
          {socialLinks.length > 0 && (
            <div className="connect-panel">
              <span className="connect-kicker">Connect With Me</span>
              <div className="social-links">
                {socialLinks.map((link, index) => {
                  const mark = getSocialMark(link.type, link.label);

                  return (
                    <a
                      href={link.url}
                      className="social-link"
                      target="_blank"
                      rel="noopener noreferrer"
                      key={`${link.label}-${index}`}
                    >
                      <span className="social-icon">
                        {link.image ? (
                          <img src={mediaUrl(link.image)} alt="" loading="lazy" />
                        ) : (
                          <span>{mark}</span>
                        )}
                      </span>
                      <span>{link.label}</span>
                      <ArrowRight size={14} strokeWidth={1.8} aria-hidden="true" />
                    </a>
                  );
                })}
              </div>
            </div>
          )}

          <div className="contact-methods">
            <div className="contact-item">
              <span className="contact-icon"><Mail size={17} strokeWidth={1.8} aria-hidden="true" /></span>
              <a href={`mailto:${contact.email}`}>{contact.email}</a>
            </div>
            <div className="contact-item">
              <span className="contact-icon"><Globe2 size={17} strokeWidth={1.8} aria-hidden="true" /></span>
              <span>{contact.website}</span>
            </div>
            <div className="contact-item">
              <span className="contact-icon"><Phone size={17} strokeWidth={1.8} aria-hidden="true" /></span>
              <span>{contact.phone}</span>
            </div>
            <div className="contact-item">
              <span className="contact-icon"><MapPin size={17} strokeWidth={1.8} aria-hidden="true" /></span>
              <span>{contact.location}</span>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} {copyright}</p>
        <a href="/admin" className="admin-link">Admin</a>
      </div>
    </footer>
  );
}
