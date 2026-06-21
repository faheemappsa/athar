import { useState } from 'react';

export default function NameModal({ onSave }) {
  const [name, setName] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();
    const trimmedName = name.trim();

    if (trimmedName) {
      onSave(trimmedName);
    }
  };

  return (
    <div className="name-modal-backdrop" role="presentation">
      <form className="name-modal glass-card" onSubmit={handleSubmit} aria-labelledby="name-modal-title">
        <p className="card-label">ترحيب شخصي</p>
        <h2 id="name-modal-title">وش تحب نناديك؟</h2>
        <p>اكتب اسمك أو لقبك عشان نخلي أثر أقرب لك.</p>
        <input
          type="text"
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="اسمك أو لقبك"
          autoFocus
        />
        <button type="submit" disabled={!name.trim()}>حفظ الاسم</button>
      </form>
    </div>
  );
}
