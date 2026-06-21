import { MailIcon } from '../pages/Help/HelpIcons.jsx';

export default function SupportModal({ onClose }) {
  return (
    <div className="support-modal-overlay" onClick={onClose}>
      <div className="support-modal-content" onClick={(e) => e.stopPropagation()}>
        <header className="support-modal-header">
          <h2 className="pixel-text support-modal-title">SUPORTE AO CAVALEIRO</h2>
          <button className="support-modal-close" onClick={onClose} aria-label="Fechar">
            &times;
          </button>
        </header>

        <div className="support-modal-body">
          <div className="support-modal-icon">
            <MailIcon size={48} />
          </div>
          <p className="support-modal-text-important">
            Para garantir que sua solicitação seja registrada e resolvida com total atenção, nosso atendimento é feito exclusivamente por e-mail.
          </p>
          <p className="support-modal-text-desc">
            Conte para nós o que aconteceu e envie para o e-mail abaixo:
          </p>
          <a href="mailto:knight-of-questions@unochapeco.edu.br" className="support-modal-email pixel-text">
            knight-of-questions@unochapeco.edu.br
          </a>
        </div>

        <footer className="support-modal-footer">
          <button className="support-modal-btn-close" onClick={onClose}>
            Fechar
          </button>
        </footer>
      </div>
    </div>
  );
}
