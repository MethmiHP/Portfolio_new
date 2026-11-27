import { MessageCircle, Send, X } from 'lucide-react';
import { motion } from 'motion/react';
import { useEffect, useState } from 'react';
import { api } from '../src/api';

export default function QASection({ settings }) {
  const copy = settings?.qa || {};
  const [items, setItems] = useState([]);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [form, setForm] = useState({ name: '', question: '' });
  const [isOpen, setIsOpen] = useState(false);

  const loadQuestions = async (skip = 0) => {
    const result = await api.getPublicQuestions({ limit: 5, skip });
    setItems((current) => (skip === 0 ? result.items : [...current, ...result.items]));
    setHasMore(result.hasMore);
  };

  useEffect(() => {
    loadQuestions()
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setMessage('');

    try {
      await api.askQuestion(form);
      setForm({ name: '', question: '' });
      const legacyMessage = 'Question sent. I will answer it from the admin panel soon.';
      setMessage(copy.success && copy.success !== legacyMessage
        ? copy.success
        : 'Thank you for your question. I’ll get back to you soon.');
    } catch (err) {
      setMessage(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={`qa-chat-widget ${isOpen ? 'open' : ''}`} id="qa">
      {!isOpen && (
        <button type="button" className="qa-chat-toggle" onClick={() => setIsOpen(true)}>
          <MessageCircle size={19} aria-hidden="true" />
          {copy.toggle || 'Ask Methmi a Question'}
        </button>
      )}

      {isOpen && (
      <motion.div
        className="qa-chat-panel"
        initial={{ opacity: 0, y: 24, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.28, ease: 'easeOut' }}
      >
        <div className="qa-chat-header">
          <div>
            <span className="qa-kicker"><MessageCircle size={15} /> Q&A</span>
            <h2>{copy.title || 'Ask me about your project'}</h2>
            <p>{copy.subtitle || 'Only my answered replies appear publicly.'}</p>
          </div>
          <button type="button" className="qa-chat-close" onClick={() => setIsOpen(false)} aria-label="Close Q&A chat">
            <X size={18} aria-hidden="true" />
          </button>
        </div>

        <div className="qa-chat-body">
          <div className="qa-showcase">
            <h3 className="subsection-title red">{copy.latestTitle || 'Latest answers'}</h3>
            {loading ? (
              <p className="qa-empty">Loading answers...</p>
            ) : items.length ? (
              <>
                <div className="qa-list">
                  {items.map((item) => (
                    <article className="qa-card" key={item._id}>
                      <div className="qa-card-head">
                        <div>
                          <span className="qa-card-label">Asked by</span>
                          <span className="qa-name">{item.name}</span>
                        </div>
                        <span className="qa-status-pill">Answered</span>
                      </div>
                      <div className="qa-dialog-block question">
                        <span>Their Question</span>
                        <p>{item.question}</p>
                      </div>
                      <div className="qa-dialog-block answer">
                        <span>{copy.replyLabel || "Methmi's Reply"}</span>
                        <p>{item.answer}</p>
                      </div>
                    </article>
                  ))}
                </div>
                {hasMore && (
                  <button type="button" className="qa-see-more" onClick={() => loadQuestions(items.length)}>
                    See More Answers
                  </button>
                )}
              </>
            ) : (
              <p className="qa-empty">No answered questions yet. Be the first to ask.</p>
            )}
          </div>

          <form className="qa-form" onSubmit={handleSubmit}>
            <p className="qa-desc">
              {copy.prompt || 'Ask a hiring, collaboration, AI, full-stack, or design question.'}
            </p>
            <label>
              Your Name
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Your name"
                required
              />
            </label>
            <label>
              Question
              <textarea
                value={form.question}
                onChange={(e) => setForm({ ...form, question: e.target.value })}
                placeholder="Ask me anything about your project..."
                rows={4}
                required
              />
            </label>
            <button type="submit" disabled={submitting}>
              {submitting ? 'Sending...' : 'Send Question'} <Send size={15} />
            </button>
            {message && <p className="qa-message">{message}</p>}
          </form>
        </div>
      </motion.div>
      )}
    </div>
  );
}
