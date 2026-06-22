import './Ranking.css';
import cavloImage from '../../assets/cavlo.png';

function formatPoints(points) {
	return Number(points || 0).toLocaleString('pt-BR');
}

export default function UserRanking({ user, perfilPontos }) {
	const name = user?.nome || user?.name || perfilPontos?.nome || perfilPontos?.userName || 'Você';
	const points = user?.pontos ?? perfilPontos?.pontos ?? 0;
	const level = user?.position ?? perfilPontos?.rank ?? '—';
	const medal = getTierLabel(points);

	return (
		<article className="user-ranking-card">
			<div className="user-ranking-card__badge pixel-text">
				{level}
			</div>

			<div className="user-ranking-card__figure" aria-hidden="true">
				<img className="user-ranking-card__figure-image" src={cavloImage} alt="" />
			</div>

			<h2 className="pixel-text user-ranking-card__name">{name}</h2>

			<div className="user-ranking-card__stats">
				<div className="user-ranking-card__coin-block">
					<strong>{formatPoints(points)}</strong>
					<span>{medal}</span>
				</div>
				<div className="user-ranking-card__badge-mini">
					<span className="user-ranking-card__badge-mini-icon" aria-hidden="true" />
					<span className="user-ranking-card__badge-mini-text">{level}</span>
				</div>
			</div>
		</article>
	);
}

function getTierLabel(points) {
	if (points >= 20000) return 'DIAMANTE';
	if (points >= 15000) return 'ESMERALDA';
	if (points >= 10000) return 'RUBI';
	if (points >= 5000) return 'AMETISTA';
	return 'BRONZE';
}
