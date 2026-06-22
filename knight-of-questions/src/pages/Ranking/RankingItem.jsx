import './Ranking.css';
import diamanteImg from '../../assets/diamante.png';
import esmeraldaImg from '../../assets/esmeralda.png';
import rubiImg from '../../assets/rubi.png';
import ametistImg from '../../assets/ametista.png';

const MEDAL_LABELS = {
	1: 'Diamante',
	2: 'Esmeralda',
	3: 'Rubi',
	4: 'Ametista',
};

const MEDAL_IMAGES = {
	1: diamanteImg,
	2: esmeraldaImg,
	3: rubiImg,
	4: ametistImg,
};

function formatPoints(points) {
	return Number(points || 0).toLocaleString('pt-BR');
}

function getInitials(name) {
	if (!name) return 'KQ';

	return name
		.split(' ')
		.filter(Boolean)
		.slice(0, 2)
		.map((part) => part[0])
		.join('')
		.toUpperCase();
}

export default function RankingItem({ user }) {
	const position = user?.position ?? '—';
	const name = user?.nome || user?.name || 'Jogador';
	const points = user?.pontos ?? 0;
	const medal = MEDAL_LABELS[position] || 'Bronze';
	const medalImg = MEDAL_IMAGES[position] || diamanteImg;
	const isCurrentUser = Boolean(user?.isCurrentUser);

	return (
		<article className={`ranking-item ${isCurrentUser ? 'ranking-item--current' : ''}`}>
			<div className="ranking-item__position pixel-text">{position}</div>

			<div className="ranking-item__avatar" aria-hidden="true">
				<span>{getInitials(name)}</span>
			</div>

			<div className="ranking-item__name-wrap">
				<h3 className="pixel-text ranking-item__name">{name}</h3>
				{isCurrentUser && <span className="ranking-item__tag">Você</span>}
			</div>

			<div className="ranking-item__score">
				<div className="ranking-item__score-meta">
					<strong>{formatPoints(points)}</strong>
					<span className="ranking-item__score-label">{medal}</span>
				</div>
				<img src={medalImg} alt={medal} className="ranking-item__medal-image" />
			</div>
		</article>
	);
}
