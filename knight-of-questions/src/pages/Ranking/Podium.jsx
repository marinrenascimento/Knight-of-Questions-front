import './Ranking.css';

const PODIUM_ORDER = [1, 0, 2];

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

export default function Podium({ users = [] }) {
	const podiumUsers = PODIUM_ORDER.map((index) => users[index]).filter(Boolean);
	const slots = [
		{ id: 'left', user: podiumUsers[0], slotClass: 'podium__slot--left' },
		{ id: 'center', user: podiumUsers[1], slotClass: 'podium__slot--center' },
		{ id: 'right', user: podiumUsers[2], slotClass: 'podium__slot--right' },
	];

	return (
		<div className="podium">
			{podiumUsers.length > 0 ? (
				slots.map(({ id, user, slotClass }, index) => {
					const position = user?.position ?? index + 1;
					const name = user?.nome || user?.name || 'Jogador';

					return (
						<div key={id} className={`podium__slot ${slotClass}`}>
							<div className="podium__ring" aria-hidden="true">
								<span>{getInitials(name)}</span>
							</div>

							<div className="podium__name pixel-text">{name}</div>

							<div className="podium__base">
								<span className="pixel-text podium__base-position">{position}</span>
							</div>
						</div>
					);
				})
			) : (
				<div className="podium__empty">Sem dados suficientes para montar o pódio.</div>
			)}
		</div>
	);
}
