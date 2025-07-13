import React, { useState, useRef, useEffect } from 'react'

const Chatbot = () => {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [selectedLanguage, setSelectedLanguage] = useState('')
  const [showLanguageSelection, setShowLanguageSelection] = useState(true)
  const chatEndRef = useRef(null)

  const languages = [
    // Major Indian Languages
    { code: 'hi', name: 'हिंदी (Hindi)' },
    { code: 'bn', name: 'বাংলা (Bengali)' },
    { code: 'te', name: 'తెలుగు (Telugu)' },
    { code: 'ta', name: 'தமிழ் (Tamil)' },
    // Foreign Languages
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Español (Spanish)' },
    { code: 'fr', name: 'Français (French)' }
  ]

  useEffect(() => {
    if (open && chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, open])

  const selectLanguage = (langCode, langName) => {
    setSelectedLanguage(langCode)
    setShowLanguageSelection(false)
    setMessages([
      { 
        sender: 'bot', 
        text: `Great! I'll respond in ${langName}. How can I assist you today?` 
      }
    ])
  }

  const sendMessage = async (e) => {
    if (e) e.preventDefault()
    if (!input.trim()) return

    const userMessage = input.trim()
    setMessages(prev => [...prev, { sender: 'user', text: userMessage }])
    setLoading(true)

    try {
      // Add language instruction to the query
      const queryWithLanguage = `Please respond in ${languages.find(lang => lang.code === selectedLanguage)?.name || 'English'}. ${userMessage}`
      
      const res = await fetch('http://localhost:8002/query', {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          input: queryWithLanguage 
        })
      })

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`)
      }

      const data = await res.json()
      console.log('Response data:', data) // Debug log
      
      setMessages(prev => [...prev, { 
        sender: 'bot', 
        text: data.response || data.answer || 'No response received.' 
      }])
    } catch (error) {
      console.error('Error:', error)
      setMessages(prev => [...prev, { 
        sender: 'bot', 
        text: `Error connecting to chatbot: ${error.message}` 
      }])
    } finally {
      setLoading(false)
      setInput('')
    }
  }

  const resetChat = () => {
    setMessages([])
    setSelectedLanguage('')
    setShowLanguageSelection(true)
  }

  return (
    <div>
      {/* Floating button */}
      {!open && (
        <button
          style={{
            position: 'fixed',
            left: 24,
            bottom: 32,
            zIndex: 1001,
            width: 56,
            height: 56,
            borderRadius: '50%',
            background: '#f6483bff',
            color: '#fff',
            border: '1px solid #333333',
            boxShadow: '0 2px 8px rgba(0,0,0,0.25)',
            cursor: 'pointer',
            fontSize: 28,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'background 0.2s'
          }}
          onClick={() => setOpen(true)}
          aria-label="Open Chatbot"
        >
          💬
        </button>
      )}

      {/* Chat window */}
      {open && (
        <div
          style={{
            position: 'fixed',
            left: 24,
            bottom: 96,
            width: 320,
            height: 400,
            background: '#1a1a1a',
            borderRadius: '1rem',
            boxShadow: '0 4px 24px rgba(0,0,0,0.25)',
            display: 'flex',
            flexDirection: 'column',
            zIndex: 1002,
            border: '1px solid #333333',
            overflow: 'hidden'
          }}
        >
          <div style={{
            padding: '12px 16px',
            borderBottom: '1px solid #333333',
            background: '#111111',
            color: '#fff',
            borderTopLeftRadius: '1rem',
            borderTopRightRadius: '1rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <span style={{ fontWeight: 600, fontSize: '1rem' }}>Chatbot</span>
            <div style={{ display: 'flex', gap: '8px' }}>
              {!showLanguageSelection && (
                <button
                  style={{
                    background: 'none',
                    border: '1px solid #333333',
                    color: '#fff',
                    fontSize: '12px',
                    cursor: 'pointer',
                    padding: '4px 8px',
                    borderRadius: '4px'
                  }}
                  onClick={resetChat}
                  aria-label="Change Language"
                >
                  🌐
                </button>
              )}
              <button
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#fff',
                  fontSize: 22,
                  cursor: 'pointer',
                  padding: '0 8px'
                }}
                onClick={() => setOpen(false)}
                aria-label="Close Chatbot"
              >
                ×
              </button>
            </div>
          </div>

          <div style={{
            flex: 1,
            overflowY: 'auto',
            padding: '12px',
            background: '#1a1a1a'
          }}>
            {showLanguageSelection ? (
              <div style={{ color: '#fff' }}>
                <h3 style={{ margin: '0 0 16px 0', fontSize: '1.1rem' }}>
                  Select your preferred language:
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      style={{
                        background: '#222222',
                        color: '#fff',
                        border: '1px solid #333333',
                        padding: '8px 12px',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        textAlign: 'left',
                        transition: 'background 0.2s'
                      }}
                      onMouseEnter={(e) => e.target.style.background = '#333333'}
                      onMouseLeave={(e) => e.target.style.background = '#222222'}
                      onClick={() => selectLanguage(lang.code, lang.name)}
                    >
                      {lang.name}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <>
                {messages.map((msg, idx) => (
                  <div key={idx} style={{
                    textAlign: msg.sender === 'user' ? 'right' : 'left',
                    margin: '8px 0'
                  }}>
                    <span style={{
                      display: 'inline-block',
                      background: msg.sender === 'user' ? '#222222' : '#333333',
                      color: '#fff',
                      padding: '8px 12px',
                      borderRadius: '16px',
                      maxWidth: '80%',
                      fontSize: '0.95rem',
                      border: msg.sender === 'user' ? '1px solid #3b82f6' : '1px solid #333333',
                      wordWrap: 'break-word'
                    }}>
                      {msg.text}
                    </span>
                  </div>
                ))}
                <div ref={chatEndRef} />
                {loading && (
                  <div style={{ 
                    color: '#999', 
                    fontSize: '0.9rem', 
                    textAlign: 'center',
                    padding: '8px'
                  }}>
                    Bot is typing...
                  </div>
                )}
              </>
            )}
          </div>

          {!showLanguageSelection && (
            <div style={{
              padding: '12px',
              borderTop: '1px solid #333333',
              background: '#111111',
              borderBottomLeftRadius: '1rem',
              borderBottomRightRadius: '1rem',
              display: 'flex',
              gap: '8px'
            }}>
              <input
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder="Type your message..."
                style={{
                  flex: 1,
                  padding: '8px',
                  borderRadius: '0.5rem',
                  border: '1px solid #333333',
                  background: '#222222',
                  color: '#fff',
                  fontSize: '1rem'
                }}
                disabled={loading}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    sendMessage(e)
                  }
                }}
              />
              <button 
                onClick={sendMessage}
                style={{
                  padding: '8px 16px',
                  borderRadius: '0.5rem',
                  background: loading ? '#666' : '#3b82f6',
                  color: '#fff',
                  border: 'none',
                  fontWeight: 600,
                  fontSize: '1rem',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  transition: 'background 0.2s'
                }} 
                disabled={loading}
              >
                Send
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default Chatbot