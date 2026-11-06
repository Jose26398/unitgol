import type { Match, Player } from "@/types";

export interface UnitGolNews {
	title: string;
	body: string;
}

interface TeamNewsContext {
	teamAPlayers: Player[];
	teamBPlayers: Player[];
	previousMatches: Match[];
	seasonId: string | null;
}

function pickNews(stories: UnitGolNews[]) {
	return stories[Math.floor(Math.random() * stories.length)];
}

function getPlayerContributionRate(player: Player) {
	return (player.goals + player.assists) / player.matches;
}

function getPlayersMentionedInStory(story: UnitGolNews, players: Player[]) {
	return players.filter(
		(player) =>
			story.title.includes(player.name) || story.body.includes(player.name),
	);
}

function getPlayerFacts(story: UnitGolNews, player: Player) {
	const text = `${story.title} ${story.body}`.toLowerCase();
	const facts: string[] = [];
	const hasGoals = /gol|tant|porter[ií]a|hat-trick|doblete/.test(text);
	const hasAssists = /asisten|pase de gol|arquitecto/.test(text);

	if (!hasGoals && player.goals > 0) {
		facts.push(`${formatGoals(player.goals)} en su trayectoria`);
	}
	if (!hasAssists && player.assists > 0) {
		facts.push(
			`${player.assists} ${player.assists === 1 ? "asistencia" : "asistencias"} repartidas`,
		);
	}
	if (player.matches > 0 && !/partidos|jornadas/.test(text)) {
		facts.push(`${player.matches} partidos disputados`);
	}
	if (player.matches > 0 && !/%/.test(text)) {
		facts.push(
			`${Math.round((player.wins / player.matches) * 100)}% de victorias`,
		);
	}

	return facts;
}

function personalizePreviewStory(
	story: UnitGolNews,
	context: TeamNewsContext,
): UnitGolNews {
	const allPlayers = [...context.teamAPlayers, ...context.teamBPlayers];
	const mentionedPlayers = getPlayersMentionedInStory(story, allPlayers);
	const playersToHighlight =
		mentionedPlayers.length > 0
			? mentionedPlayers.slice(0, 2)
			: [context.teamAPlayers, context.teamBPlayers]
					.map(
						(team) =>
							team
								.filter((player) => player.matches > 0)
								.sort(
									(first, second) =>
										getPlayerContributionRate(second) -
										getPlayerContributionRate(first),
								)[0],
					)
					.filter((player): player is Player => player !== undefined);
	if (playersToHighlight.length === 0) return story;

	const playerDetails = playersToHighlight
		.map((player) => ({
			player,
			facts: getPlayerFacts(story, player).slice(0, 3),
		}))
		.filter(({ facts }) => facts.length > 0);
	if (playerDetails.length === 0) return story;

	const focus =
		mentionedPlayers.length > 1
			? `El cara a cara también tiene cifras propias: ${playerDetails.map(({ player, facts }) => `${player.name}, ${facts.join(" y ")}`).join("; mientras que ")}.`
			: mentionedPlayers.length === 1
				? `A su historia de hoy se suma otro dato: ${playerDetails[0].facts.join(" y ")}.`
				: `Entre los nombres a seguir, ${playerDetails.map(({ player, facts }) => `${player.name} aporta ${facts.join(" y ")}`).join("; y ")}.`;

	return { ...story, body: `${story.body}\n\n${focus}` };
}

function getPlayerResult(playerId: string, match: Match) {
	const isInTeamA = isPlayerInTeam(playerId, match.teamA.players);
	const playerScore = isInTeamA ? match.teamA.score : match.teamB.score;
	const opponentScore = isInTeamA ? match.teamB.score : match.teamA.score;

	return playerScore > opponentScore
		? "win"
		: playerScore < opponentScore
			? "loss"
			: "draw";
}

function getCurrentWinningStreak(
	playerId: string,
	previousMatches: Match[],
	seasonId: string | null,
) {
	let streak = 0;
	const matches = previousMatches
		.filter(
			(match) =>
				(seasonId === null || match.seasonId === seasonId) &&
				isPlayerInMatch(playerId, match),
		)
		.sort(
			(first, second) =>
				new Date(second.date).getTime() - new Date(first.date).getTime(),
		);

	for (const match of matches) {
		if (getPlayerResult(playerId, match) !== "win") break;
		streak += 1;
	}

	return streak;
}

function getEvenlyMatchedPlayers(
	teamAPlayers: Player[],
	teamBPlayers: Player[],
) {
	let bestDuel: {
		playerA: Player;
		playerB: Player;
		difference: number;
	} | null = null;

	for (const playerA of teamAPlayers) {
		if (playerA.matches === 0) continue;

		for (const playerB of teamBPlayers) {
			if (playerB.matches === 0) continue;

			const winRateDifference = Math.abs(
				playerA.wins / playerA.matches - playerB.wins / playerB.matches,
			);
			const contributionRateDifference = Math.abs(
				(playerA.goals + playerA.assists) / playerA.matches -
					(playerB.goals + playerB.assists) / playerB.matches,
			);
			const difference = winRateDifference + contributionRateDifference;

			if (
				difference <= 0.15 &&
				(!bestDuel || difference < bestDuel.difference)
			) {
				bestDuel = { playerA, playerB, difference };
			}
		}
	}

	return bestDuel;
}

function getRecentHatTrick(
	players: Player[],
	previousMatches: Match[],
	seasonId: string | null,
) {
	let recentHatTrick: { player: Player; goals: number; date: number } | null =
		null;
	for (const player of players) {
		const latestMatch = previousMatches
			.filter(
				(match) =>
					(seasonId === null || match.seasonId === seasonId) &&
					isPlayerInMatch(player.id, match),
			)
			.sort(
				(first, second) =>
					new Date(second.date).getTime() - new Date(first.date).getTime(),
			)[0];
		if (!latestMatch) continue;

		const goals = latestMatch.goals.filter(
			(goal) => goal.playerId === player.id,
		).length;
		const date = new Date(latestMatch.date).getTime();
		if (
			goals >= 3 &&
			Number.isFinite(date) &&
			(!recentHatTrick || date > recentHatTrick.date)
		) {
			recentHatTrick = { player, goals, date };
		}
	}

	return recentHatTrick;
}

export function createTeamNews(
	teamAValue: number,
	teamBValue: number,
	context?: TeamNewsContext,
): UnitGolNews {
	const lowerValue = Math.min(Math.abs(teamAValue), Math.abs(teamBValue));
	const difference = Math.abs(teamAValue - teamBValue);
	const differencePercent =
		lowerValue === 0
			? difference === 0
				? 0
				: null
			: (difference / lowerValue) * 100;

	if (!context) {
		if (differencePercent !== null && differencePercent <= 8) {
			return pickNews([
				{
					title: "Duelo de máxima igualdad",
					body: `La diferencia de valoración entre los equipos es de solo un ${differencePercent.toFixed(0)}%. Sobre el papel no hay favorito y cada detalle puede inclinar la balanza. ¿Quién dará el primer golpe? La concentración desde el inicio será fundamental para no regalar ventaja en un partido que promete decidirse por pequeños matices. Si ambos mantienen el pulso, el desenlace puede quedar abierto hasta la última jugada.`,
				},
				{
					title: "La estadística no se atreve a elegir",
					body: `Los números apenas separan a los dos equipos. La previa apunta a un choque de nervios, acierto y concentración: aquí nadie puede permitirse un despiste. Cada recuperación y cada ocasión pueden pesar más de lo habitual, porque ninguno llega con margen suficiente para confiarse. El primero que consiga imponer su ritmo tendrá una oportunidad de oro para inclinar un duelo que, sobre el papel, no tiene dueño.`,
				},
				{
					title: "Noventa minutos para romper los pronósticos",
					body: `La igualdad en las valoraciones deja el pronóstico completamente abierto. Un gol tempranero puede cambiar el guion y obligar al rival a arriesgar. A partir de ahí, saber gestionar la ventaja —o mantener la calma si toca ir por detrás— será casi tan importante como encontrar portería. No hay un plan que garantice el triunfo: tocará leer bien cada momento del partido.`,
				},
				{
					title: "Prohibido confiarse",
					body: `No hay una ventaja clara sobre el papel. Ambos equipos tienen argumentos para llevarse el partido y la diferencia estará en quién aproveche mejor sus oportunidades. La eficacia en las áreas puede romper una igualdad que las valoraciones no consiguen resolver. Si el marcador se mantiene ajustado, cualquier acción aislada puede convertirse en la jugada que todos recuerden al final.`,
				},
				{
					title: "Todo por decidir antes del silbato",
					body: `Las valoraciones dejan a los dos equipos prácticamente en el mismo punto de partida. Ninguno podrá esperar que el rival cometa errores por sí solo: habrá que buscarlos con intensidad y aprovecharlos cuando aparezcan. La primera ocasión clara puede cambiar la confianza de ambos y abrir un partido que promete tensión hasta el cierre.`,
				},
				{
					title: "Una previa sin respuestas fáciles",
					body: `La igualdad previa convierte este cruce en una incógnita de las buenas. Los dos equipos tienen motivos para creer y ninguno cuenta con una diferencia que le permita relajarse. El que consiga mantener el orden cuando lleguen los nervios tendrá una pequeña ventaja en una jornada en la que cada balón dividido puede contar.`,
				},
			]);
		}

		const favoredTeam = teamAValue > teamBValue ? "Equipo A" : "Equipo B";
		const underdog = favoredTeam === "Equipo A" ? "Equipo B" : "Equipo A";
		const percentText =
			differencePercent === null
				? "una valoración superior, aunque todavía faltan datos del rival"
				: `una valoración un ${differencePercent.toFixed(0)}% superior`;

		return pickNews([
			{
				title: `${favoredTeam} parte con ventaja`,
				body: `${favoredTeam} llega con ${percentText} y asume el papel de favorito. Pero ${underdog} tendrá la oportunidad de desafiar los pronósticos: los partidos se ganan en la pista, no en la previa. La ventaja estadística puede dar confianza, aunque también añade presión cuando empiece a rodar el balón. Si ${underdog} consigue competir de tú a tú desde el comienzo, el favoritismo podría pesar más de lo esperado.`,
			},
			{
				title: `La presión apunta a ${favoredTeam}`,
				body: `${favoredTeam} tiene mejores números y deberá demostrarlo cuando empiece el partido. ${underdog}, por su parte, puede jugar sin complejos y convertir cualquier error en una oportunidad. La clave estará en quién consiga imponer su ritmo sin precipitarse: el favorito querrá confirmar su superioridad y el aspirante buscará que el encuentro se juegue en sus propios términos. Una pérdida peligrosa o una ocasión bien aprovechada puede cambiar el ambiente en un instante.`,
			},
			{
				title: `${underdog} busca dar el golpe`,
				body: `Las valoraciones colocan a ${favoredTeam} por delante, pero ${underdog} quiere ser la sorpresa de la jornada. Un buen inicio podría cambiar por completo las expectativas. Si el equipo menos favorecido golpea primero, obligará al rival a replantear sus planes y abrirá un partido nuevo. ${favoredTeam} tendrá que responder con fútbol y no solo con su posición en los números.`,
			},
			{
				title: "Favorito sí, invencible no",
				body: `${favoredTeam} llega con mejores números, aunque eso también implica presión. Su rival buscará incomodarle desde el primer minuto y demostrar que las estadísticas no marcan goles. El equipo favorito deberá evitar que la confianza se convierta en exceso de seguridad, mientras que su contrincante tiene permiso para jugar con valentía. La primera disputa por el control puede marcar el tono de toda la jornada.`,
			},
			{
				title: `${favoredTeam} quiere confirmar los pronósticos`,
				body: `La previa coloca a ${favoredTeam} un paso por delante, pero el siguiente paso es demostrarlo en el campo. ${underdog} intentará que el favoritismo se convierta en impaciencia y aprovechar cualquier espacio que aparezca. Si el equipo mejor valorado consigue adelantarse, tendrá que gestionar la ventaja; si no, la presión puede crecer con cada minuto.`,
			},
			{
				title: "La sorpresa también está convocada",
				body: `${underdog} parte con menos respaldo en los números, pero eso no le quita argumentos para competir. Un partido serio, paciencia para esperar su momento y acierto en las ocasiones pueden cambiar por completo el guion. ${favoredTeam} sabe que no basta con llegar como favorito: tendrá que ganarse cada ventaja sobre el terreno de juego.`,
			},
		]);
	}

	const stories: UnitGolNews[] = [];
	const players = [...context.teamAPlayers, ...context.teamBPlayers];
	const validPlayers = players.filter((player) => player.matches > 0);
	const teamAName = "Equipo A";
	const teamBName = "Equipo B";

	if (differencePercent !== null && differencePercent <= 8) {
		stories.push(
			{
				title: "Duelo de máxima igualdad",
				body: `La diferencia de valoración entre los equipos es de solo un ${differencePercent.toFixed(0)}%. No hay un favorito claro y cualquier detalle puede decidir la jornada. ¿Quién soportará mejor la presión? En un cruce tan parejo, ganar los duelos y mantener la cabeza fría puede valer tanto como una gran jugada. Ninguno podrá esperar que el rival le regale el partido.`,
			},
			{
				title: "Un partido que promete moneda al aire",
				body: `Los dos equipos llegan prácticamente calcados en valoración. La previa apunta a un choque de alternativas en el que una recuperación, una asistencia o un gol pueden cambiarlo todo. Habrá que estar atentos a los cambios de ritmo y a quién consigue enlazar varias jugadas con peligro. Con tan poca distancia entre ambos, una desconexión breve puede tener consecuencias durante el resto del encuentro.`,
			},
			{
				title: "La estadística se queda sin favorito",
				body: `Los números no encuentran una ventaja clara entre ambos equipos. El margen de error será mínimo y quien aproveche mejor sus ocasiones tendrá mucho ganado. La paciencia también puede ser decisiva: precipitarse para buscar la ventaja podría dejar espacios que el rival sabrá aprovechar. Se espera un pulso en el que cada equipo tendrá que demostrar que sabe competir cuando el marcador aprieta.`,
			},
			{
				title: "Dos caminos hacia una misma oportunidad",
				body: `La valoración no concede ventaja suficiente a ninguno y deja la previa abierta a cualquier desenlace. Un equipo puede dominar por tramos y el otro responder en cuanto encuentre un espacio; por eso será importante no desconectarse después de una buena jugada. La igualdad promete una batalla de paciencia, energía y decisiones acertadas.`,
			},
			{
				title: "El primer golpe puede cambiarlo todo",
				body: `Con tan poca diferencia entre ambos equipos, adelantarse en el marcador puede tener un efecto enorme. El que golpee primero obligará al rival a mover ficha, pero todavía tendrá que sostener su plan durante el resto del partido. No hay margen para celebrar antes de tiempo: la respuesta puede llegar en la siguiente jugada.`,
			},
		);
	} else {
		const favoredTeam = teamAValue > teamBValue ? teamAName : teamBName;
		const underdog = favoredTeam === teamAName ? teamBName : teamAName;
		const percentText =
			differencePercent === null
				? "una valoración superior, aunque faltan datos del rival"
				: `una valoración un ${differencePercent.toFixed(0)}% superior`;

		stories.push(
			{
				title: `${favoredTeam} parte con ventaja`,
				body: `${favoredTeam} llega con ${percentText} y asume el papel de favorito. ${underdog} tendrá que buscar sus opciones y tratar de romper los pronósticos desde el inicio. La diferencia de partida no garantiza nada cuando comienza el encuentro: ${favoredTeam} debe convertir su ventaja en ocasiones y ${underdog} puede crecer si consigue resistir los primeros ataques. La jornada pondrá a prueba tanto las expectativas como la capacidad de reacción de ambos.`,
			},
			{
				title: `La presión está del lado de ${favoredTeam}`,
				body: `${favoredTeam} tiene los números a favor, pero ahora debe trasladarlos a la pista. ${underdog} puede jugar sin complejos y convertir cualquier desconexión en una oportunidad. Mantener el orden y no conceder transiciones sencillas será importante para quien parte por detrás; para el favorito, la tarea será encontrar soluciones sin dejarse llevar por la impaciencia. El primer tramo del partido puede aclarar si la previa se cumple o empieza a saltar por los aires.`,
			},
			{
				title: `${underdog} prepara el asalto al pronóstico`,
				body: `${favoredTeam} aparece por delante en las valoraciones, pero ${underdog} no renuncia a dar la sorpresa. Un inicio intenso puede cambiar la historia de la jornada. Si ${underdog} disputa cada balón y encuentra espacios a la espalda, puede convertir la presión en una aliada. ${favoredTeam} tendrá que responder con personalidad para que la sorpresa no empiece a tomar forma.`,
			},
		);
	}

	const duel = getEvenlyMatchedPlayers(
		context.teamAPlayers,
		context.teamBPlayers,
	);
	if (duel) {
		stories.push(
			{
				title: `${duel.playerA.name} contra ${duel.playerB.name}: duelo igualado`,
				body: `Se avecina un duelo individual muy equilibrado. ${duel.playerA.name} y ${duel.playerB.name} presentan porcentajes de victorias y aportaciones ofensivas por partido muy similares. ¿Quién conseguirá marcar diferencias esta vez? Su influencia puede aparecer en una definición, una asistencia o una acción que cambie el ritmo del partido. Ninguno parte con una ventaja evidente, así que el cara a cara promete mantenerse abierto hasta que uno encuentre la manera de imponerse.`,
			},
			{
				title: `${duel.playerA.name} y ${duel.playerB.name}: dos espejos`,
				body: `Los números de ${duel.playerA.name} y ${duel.playerB.name} apenas se separan. Ambos llegan con un rendimiento parecido en resultados y producción ofensiva: un cara a cara que puede convertirse en uno de los focos del partido. La atención estará en quién logra aparecer con más continuidad y ayudar a su equipo cuando el encuentro se atasque. Si uno consigue desequilibrar, el otro tendrá el reto de responder y evitar que el duelo se decida demasiado pronto.`,
			},
			{
				title: "Un pulso individual que promete",
				body: `${duel.playerA.name} y ${duel.playerB.name} llegan con estadísticas muy parejas. No hay un dominador claro en este enfrentamiento y cualquier acción puede inclinar el duelo. Un buen movimiento sin balón, una recuperación o una ocasión resuelta con sangre fría pueden ser suficientes para romper el equilibrio. El pulso promete tener réplicas: cada vez que uno dé un paso al frente, el otro tendrá la oportunidad de contestar.`,
			},
			{
				title: `La respuesta de ${duel.playerB.name} al reto de ${duel.playerA.name}`,
				body: `${duel.playerA.name} y ${duel.playerB.name} llegan tan parejos que el duelo puede decidirse por una sola aparición. Uno buscará marcar territorio desde el inicio; el otro tendrá la oportunidad de responder y cambiar el foco del partido. Si ambos encuentran espacios, sus equipos pueden convertir este cara a cara en una batalla de ida y vuelta.`,
			},
			{
				title: "Duelo de detalles entre dos jugadores parejos",
				body: `Las cifras ponen a ${duel.playerA.name} y ${duel.playerB.name} prácticamente a la misma altura. El partido les ofrece una nueva comparación directa, esta vez sin porcentajes que valgan: contará quién aprovecha mejor sus oportunidades y ayuda a su equipo en los momentos de más presión. Puede que la diferencia llegue en una acción que no aparezca en las estadísticas.`,
			},
		);
	}

	const topGoalContributor = [...validPlayers].sort(
		(a, b) =>
			(b.goals + b.assists) / b.matches - (a.goals + a.assists) / a.matches,
	)[0];
	if (topGoalContributor) {
		const rate = (
			(topGoalContributor.goals + topGoalContributor.assists) /
			topGoalContributor.matches
		).toFixed(2);
		stories.push(
			{
				title: `${topGoalContributor.name}, participación decisiva`,
				body: `${topGoalContributor.name} promedia ${rate} goles o asistencias por partido. Su capacidad para aparecer en los momentos importantes puede ser una de las grandes amenazas para el rival. No siempre necesita muchas oportunidades para dejar su huella, y por eso la defensa tendrá que vigilar sus movimientos durante todo el encuentro. Si encuentra espacios cerca del área, puede convertir una jugada aislada en el punto de inflexión de la jornada.`,
			},
			{
				title: "Un jugador al que no se puede perder de vista",
				body: `${topGoalContributor.name} es uno de los nombres propios de esta previa: suma ${topGoalContributor.goals} goles y ${topGoalContributor.assists} asistencias en ${topGoalContributor.matches} partidos. ¿Volverá a participar directamente en el marcador? Su aportación puede llegar tanto con una finalización como encontrando al compañero mejor situado. El rival tendrá que decidir cómo reducir su influencia sin descuidar al resto de amenazas.`,
			},
			{
				title: `La jugada puede pasar por ${topGoalContributor.name}`,
				body: `${topGoalContributor.name} llega con una producción ofensiva constante y puede ser el punto de partida de las mejores ocasiones. Si recibe con tiempo, tendrá opciones para finalizar o activar a un compañero; si el rival le cierra el camino, deberá buscar otras maneras de influir. Su capacidad para elegir bien puede ser una de las claves de la previa.`,
			},
		);
	}

	const assistLeader = [...validPlayers].sort(
		(a, b) => b.assists - a.assists,
	)[0];
	if (assistLeader && assistLeader.assists > 0) {
		stories.push(
			{
				title: `${assistLeader.name}, el arquitecto del ataque`,
				body: `${assistLeader.name} llega como uno de los grandes asistentes de estos equipos, con ${assistLeader.assists} pases de gol. Su visión puede ser clave para encontrar espacios en una defensa que tendrá que vigilarle de cerca. Si consigue recibir con tiempo para levantar la cabeza, sus compañeros pueden sacar partido de cada desmarque. A veces el pase que rompe el partido llega justo cuando todos esperan que el asistente busque la portería.`,
			},
			{
				title: "Ojo a la última asistencia",
				body: `${assistLeader.name} ha repartido ${assistLeader.assists} asistencias y puede volver a ser decisivo sin necesidad de marcar. Si encuentra a sus compañeros entre líneas, el partido puede cambiar. Su lectura del juego será una prueba para la defensa rival, que deberá cerrar caminos sin perder de vista las llegadas desde atrás. Un buen pase puede tener el mismo peso que un gol en una jornada tan disputada.`,
			},
			{
				title: `${assistLeader.name} busca el pase que abra el partido`,
				body: `${assistLeader.name} ya ha demostrado que sabe encontrar a sus compañeros en posición de peligro. Ahora el desafío será detectar cuándo acelerar y cuándo mover al rival hasta que aparezca el hueco. Una defensa pendiente de sus pases puede dejar libre otra zona, y ahí puede nacer una ocasión inesperada.`,
			},
		);
	}

	const goalLeader = [...validPlayers].sort((a, b) => b.goals - a.goals)[0];
	if (goalLeader && goalLeader.goals > 0) {
		stories.push(
			{
				title: `${goalLeader.name} amenaza con más pólvora`,
				body: `${goalLeader.name} suma ${goalLeader.goals} goles en la temporada y será una de las referencias ofensivas a seguir. La defensa rival ya tiene deberes: evitar que encuentre espacios. Cada recepción cerca del área exigirá atención, porque concederle tiempo para perfilarse puede salir caro. También habrá que vigilar quién le acompaña: si el rival concentra demasiados esfuerzos en frenarlo, otro jugador podría aprovechar el espacio liberado.`,
			},
			{
				title: "El gol tiene nombre propio",
				body: `${goalLeader.name} es el jugador que más veces ha encontrado la red entre los dos equipos, con ${goalLeader.goals} tantos. ¿Ampliará su cuenta en esta jornada o aparecerá un nuevo protagonista? La defensa tendrá que estar pendiente de sus movimientos, aunque marcarle de cerca también puede abrir huecos para sus compañeros. El foco está puesto en él, pero la historia del partido todavía puede escribirla cualquiera.`,
			},
			{
				title: `${goalLeader.name} afronta una nueva prueba ante la portería`,
				body: `${goalLeader.name} llega como el máximo goleador de estos equipos y tendrá otra oportunidad para demostrar su olfato. El rival intentará reducirle los espacios, así que quizá la clave esté en la rapidez con la que se mueva y en cómo se asocie con sus compañeros. Si consigue una ocasión clara, ya ha demostrado que sabe convertirla en noticia.`,
			},
		);
	}

	const longestStreak = players
		.map((player) => ({
			player,
			streak: getCurrentWinningStreak(
				player.id,
				context.previousMatches,
				context.seasonId,
			),
		}))
		.sort((a, b) => b.streak - a.streak)[0];

	if (longestStreak && longestStreak.streak >= 2) {
		const opponents = isPlayerInTeam(
			longestStreak.player.id,
			context.teamAPlayers,
		)
			? context.teamBPlayers
			: context.teamAPlayers;
		const challenger = [...opponents].sort(
			(a, b) => b.goals + b.assists - (a.goals + a.assists),
		)[0];

		stories.push(
			{
				title: `¿Quién podrá frenar a ${longestStreak.player.name}?`,
				body: `${longestStreak.player.name} encadena ${longestStreak.streak} victorias consecutivas. La racha está en juego y el rival tendrá una motivación extra: convertirse en el equipo que consiga detenerle. Cada triunfo aumenta la confianza, pero también convierte al jugador en un objetivo más visible para sus contrarios. La pregunta es si mantendrá la calma cuando el partido se complique o si esta vez alguien conseguirá poner fin a la serie.`,
			},
			{
				title: `${longestStreak.player.name}, contra el desafío de mantener la racha`,
				body: `Ganar se ha convertido en costumbre para ${longestStreak.player.name}, que suma ${longestStreak.streak} triunfos seguidos. Pero cada jornada aumenta la presión. ¿Seguirá ampliando la serie o llegará hoy el frenazo? El rival sabe que una victoria tendría un valor especial y tratará de convertir cada disputa en una oportunidad. Mantener viva la racha requerirá algo más que confianza: también hará falta responder cuando llegue el momento difícil.`,
			},
			{
				title: `La racha de ${longestStreak.player.name} ya tiene un nuevo examen`,
				body: `${longestStreak.player.name} llega con ${longestStreak.streak} victorias seguidas y vuelve a poner su continuidad a prueba. El rival no necesita mirar más lejos: una victoria suya acabaría con la serie y sería un golpe de confianza. El reto será sostener el nivel cuando la presión apriete y no dejar que la racha pese más que el partido.`,
			},
		);

		if (challenger) {
			stories.push({
				title: `${challenger.name} quiere ser el verdugo`,
				body: `${challenger.name} aparece como uno de los principales argumentos ofensivos del rival y tendrá una misión especial: intentar acabar con las ${longestStreak.streak} victorias consecutivas de ${longestStreak.player.name}. Para lograrlo, deberá aprovechar sus ocasiones y empujar a su equipo a competir cada balón como si fuera decisivo. Si consigue imponer su iniciativa, la racha tendrá delante una prueba de las más exigentes.`,
			});
		}
	}

	const hatTrick = getRecentHatTrick(
		players,
		context.previousMatches,
		context.seasonId,
	);
	if (hatTrick) {
		stories.push(
			{
				title: `${hatTrick.player.name} llega con el punto de mira ajustado`,
				body: `${hatTrick.player.name} viene de marcar ${formatGoals(hatTrick.goals)} en su último partido. Después de semejante exhibición, todas las miradas estarán sobre él. ¿Podrá repetir una noche mágica? La defensa no podrá perderle la pista, pero el propio jugador también tendrá que gestionar las expectativas y esperar el momento adecuado para atacar. Su última actuación ya dejó el listón alto; ahora toca ver cómo responde con todos pendientes de sus movimientos.`,
			},
			{
				title: "La defensa tiene una alerta roja",
				body: `${hatTrick.player.name} viene de firmar un hat-trick y será una amenaza evidente. El rival tendrá que decidir cómo frenarle: ¿marcaje especial o confiar en que no repita su actuación? Doblar la vigilancia puede dejar a otros compañeros con más libertad, así que el plan defensivo tendrá que encontrar el equilibrio. El goleador, mientras tanto, tendrá una nueva oportunidad para demostrar que aquella exhibición no fue casualidad.`,
			},
			{
				title: `¿Habrá otro festival de ${hatTrick.player.name}?`,
				body: `Tres goles en su último encuentro han colocado a ${hatTrick.player.name} en el centro de la conversación. La pregunta es inevitable: ¿estamos ante el inicio de una racha goleadora o fue una actuación irrepetible? La próxima defensa querrá comprobarlo de primera mano y seguramente le concederá pocos espacios. Si vuelve a encontrar portería incluso con esa atención extra, el aviso para las siguientes jornadas será todavía más serio.`,
			},
			{
				title: `${hatTrick.player.name} vuelve a escena tras su gran noche`,
				body: `El hat-trick de ${hatTrick.player.name} todavía está fresco en la memoria y ahora llega la prueba de continuidad. Los rivales ya saben el daño que puede hacer si encuentra espacios, así que el desafío será abrirse camino con menos libertad. Una nueva aparición decisiva confirmaría que su última actuación fue algo más que una noche redonda.`,
			},
		);
	}

	if (validPlayers.length >= 2) {
		const bestWinRate = [...validPlayers].sort(
			(a, b) => b.wins / b.matches - a.wins / a.matches,
		)[0];
		const worstWinRate = [...validPlayers].sort(
			(a, b) => a.wins / a.matches - b.wins / b.matches,
		)[0];

		if (bestWinRate && bestWinRate.id !== worstWinRate?.id) {
			stories.push({
				title: `${bestWinRate.name} quiere imponer su ley`,
				body: `${bestWinRate.name} presenta el mejor porcentaje de victorias entre los jugadores con partidos disputados. Enfrente tendrá a un rival que busca cambiar la tendencia y demostrar que los porcentajes no deciden los enfrentamientos. Los antecedentes le dan un motivo para confiar, aunque cada partido empieza de cero y exige volver a ganarse el resultado. Será interesante ver si logra sostener su influencia cuando el otro equipo intente llevar el duelo a su terreno.`,
			});
			stories.push({
				title: `${bestWinRate.name} pone su buen registro a prueba`,
				body: `${bestWinRate.name} llega con el porcentaje de victorias más alto entre los jugadores con experiencia y tendrá una nueva ocasión para respaldar ese dato. El rival querrá convertir el partido en una prueba incómoda y obligarle a competir cada balón. Los números hablan de lo que ya ha hecho; ahora la pista decidirá si puede volver a marcar la diferencia.`,
			});
		}
	}

	return pickNews(
		stories.map((story) => personalizePreviewStory(story, context)),
	);
}

function isPlayerInMatch(playerId: string, match: Match) {
	return (
		match.teamA.players.some((player) => player.id === playerId) ||
		match.teamB.players.some((player) => player.id === playerId)
	);
}

function isPlayerInTeam(playerId: string, players: Player[]) {
	return players.some((player) => player.id === playerId);
}

function previousMatchesForPlayer(
	playerId: string,
	match: Omit<Match, "id">,
	previousMatches: Match[],
) {
	const matchTime = new Date(match.date).getTime();

	return previousMatches
		.filter((previousMatch) => {
			const previousMatchTime = new Date(previousMatch.date).getTime();
			return (
				previousMatch.seasonId === match.seasonId &&
				previousMatchTime < matchTime &&
				Number.isFinite(previousMatchTime) &&
				isPlayerInMatch(playerId, previousMatch)
			);
		})
		.sort(
			(first, second) =>
				new Date(second.date).getTime() - new Date(first.date).getTime(),
		);
}

function getWinningStreak(
	playerId: string,
	match: Omit<Match, "id">,
	previousMatches: Match[],
) {
	const playerIsInTeamA = isPlayerInTeam(playerId, match.teamA.players);
	const playerScore = playerIsInTeamA ? match.teamA.score : match.teamB.score;
	const opponentScore = playerIsInTeamA ? match.teamB.score : match.teamA.score;

	if (playerScore <= opponentScore) return 0;

	let streak = 1;
	for (const previousMatch of previousMatchesForPlayer(
		playerId,
		match,
		previousMatches,
	)) {
		const isInTeamA = isPlayerInTeam(playerId, previousMatch.teamA.players);
		const previousScore = isInTeamA
			? previousMatch.teamA.score
			: previousMatch.teamB.score;
		const previousOpponentScore = isInTeamA
			? previousMatch.teamB.score
			: previousMatch.teamA.score;

		if (previousScore <= previousOpponentScore) break;
		streak += 1;
	}

	return streak;
}

function getTopScorer(match: Omit<Match, "id">) {
	const players = [...match.teamA.players, ...match.teamB.players];
	const goalsByPlayer = new Map<string, number>();

	for (const goal of match.goals) {
		if (players.some((player) => player.id === goal.playerId)) {
			goalsByPlayer.set(
				goal.playerId,
				(goalsByPlayer.get(goal.playerId) ?? 0) + 1,
			);
		}
	}

	let topScorer: { player: Player; goals: number } | null = null;
	for (const [playerId, goals] of goalsByPlayer) {
		if (!topScorer || goals > topScorer.goals) {
			const player = players.find((candidate) => candidate.id === playerId);
			if (player) topScorer = { player, goals };
		}
	}

	return topScorer;
}

function formatGoals(goals: number) {
	return `${goals} ${goals === 1 ? "gol" : "goles"}`;
}

function formatAssists(assists: number) {
	return `${assists} ${assists === 1 ? "asistencia" : "asistencias"}`;
}

function formatGoalDifference(difference: number) {
	return `${difference} ${difference === 1 ? "gol" : "goles"}`;
}

function personalizeMatchStory(
	story: UnitGolNews,
	match: Omit<Match, "id">,
	previousMatches: Match[],
): UnitGolNews {
	const players = [...match.teamA.players, ...match.teamB.players];
	let mentionedPlayers = getPlayersMentionedInStory(story, players);
	const mentionedIds = new Set(mentionedPlayers.map((player) => player.id));
	const scorerIds = new Set(
		match.goals
			.filter(
				(goal) => mentionedIds.size === 0 || mentionedIds.has(goal.playerId),
			)
			.map((goal) => goal.playerId),
	);
	if (scorerIds.size > 0) {
		const relatedIds = new Set(scorerIds);
		for (const goal of match.goals) {
			if (scorerIds.has(goal.playerId) && goal.assistById) {
				relatedIds.add(goal.assistById);
			}
		}
		mentionedPlayers = players
			.filter((player) => relatedIds.has(player.id))
			.sort(
				(first, second) =>
					match.goals.filter((goal) => goal.playerId === second.id).length -
					match.goals.filter((goal) => goal.playerId === first.id).length,
			);
	}
	if (mentionedPlayers.length === 0) {
		mentionedPlayers = [match.teamA.players, match.teamB.players]
			.map(
				(team) =>
					team
						.filter((player) => player.matches > 0)
						.sort(
							(first, second) =>
								getPlayerContributionRate(second) -
								getPlayerContributionRate(first),
						)[0],
			)
			.filter((player): player is Player => player !== undefined);
	}

	const text = `${story.title} ${story.body}`.toLowerCase();
	const details = mentionedPlayers.slice(0, 2).map((player) => {
		const goals = match.goals.filter((goal) => goal.playerId === player.id);
		const assists = match.goals.filter(
			(goal) => goal.assistById === player.id && goal.playerId !== player.id,
		).length;
		const minutes = goals.map((goal) => goal.minute);
		const facts: string[] = [];

		if (minutes.length > 0 && !/minutos?/.test(text)) {
			facts.push(`sus goles llegaron en los minutos ${minutes.join(", ")}`);
		}
		if (assists > 0 && !/asisten|pase de gol/.test(text)) {
			facts.push(`también dio ${formatAssists(assists)}`);
		}
		if (player.matches > 0 && !/partidos|jornadas/.test(text)) {
			facts.push(`lleva ${player.matches} partidos disputados`);
		}
		if (player.matches > 0 && !/%/.test(text)) {
			facts.push(
				`${Math.round((player.wins / player.matches) * 100)}% de victorias antes de esta jornada`,
			);
		}

		const streak = getWinningStreak(player.id, match, previousMatches);
		if (
			streak >= 3 &&
			!text.includes(`${streak} victorias`) &&
			!text.includes(`${streak} triunfos`)
		) {
			facts.push(`${streak} victorias consecutivas`);
		}

		return facts;
	});
	const uniqueDetails = details.filter((facts) => facts.length > 0);
	if (uniqueDetails.length === 0) return story;
	const focus =
		uniqueDetails.length > 1
			? `La letra pequeña también deja protagonistas: ${mentionedPlayers
					.slice(0, uniqueDetails.length)
					.map(
						(player, index) =>
							`${player.name}, ${uniqueDetails[index].join(" y ")}`,
					)
					.join("; mientras que ")}.`
			: `${story.title.includes(mentionedPlayers[0]?.name ?? "") ? "Y hay un detalle más para completar su historia" : `La actuación de ${mentionedPlayers[0]?.name} deja otro dato`}: ${uniqueDetails[0].join(" y ")}.`;
	return { ...story, body: `${story.body}\n\n${focus}` };
}

export function createMatchNews(
	match: Omit<Match, "id">,
	previousMatches: Match[],
): UnitGolNews {
	const isDraw = match.teamA.score === match.teamB.score;
	const totalGoals = match.teamA.score + match.teamB.score;
	const isTeamAWinner = match.teamA.score > match.teamB.score;
	const winner = isTeamAWinner ? "Equipo A" : "Equipo B";
	const loser = isTeamAWinner ? "Equipo B" : "Equipo A";
	const winnerScore = isTeamAWinner ? match.teamA.score : match.teamB.score;
	const loserScore = isTeamAWinner ? match.teamB.score : match.teamA.score;
	const scoreDifference = Math.abs(match.teamA.score - match.teamB.score);
	const topScorer = getTopScorer(match);
	const players = [...match.teamA.players, ...match.teamB.players];
	const stories: UnitGolNews[] = [];

	if (topScorer) {
		const scorerTeam = isPlayerInTeam(topScorer.player.id, match.teamA.players)
			? "Equipo A"
			: "Equipo B";
		const scoringSummary = `${topScorer.player.name} anotó ${formatGoals(topScorer.goals)}`;

		if (topScorer.goals >= 3) {
			stories.push(
				{
					title: `¡Hat-trick de ${topScorer.player.name}!`,
					body: `${scoringSummary} y firmó la actuación individual más destacada del encuentro. El marcador terminó ${match.teamA.score}-${match.teamB.score}, pero su exhibición merece capítulo propio. ¿Será capaz de mantener este nivel en la próxima jornada? Cada gol llegó como una respuesta a la defensa rival y convirtió su noche en una pesadilla para quienes intentaban contenerle. El listón queda muy alto, aunque actuaciones así también sirven para ganar confianza y pedir más protagonismo.`,
				},
				{
					title: `${topScorer.player.name} se lleva el balón de la noche`,
					body: `Tres o más goles de ${topScorer.player.name} en un partido que no olvidará fácilmente. Su instinto goleador fue protagonista y deja una pregunta en el aire: ¿acaba de arrancar una racha imparable? La defensa probó distintas maneras de frenarlo, pero encontró respuesta una y otra vez. Ahora los próximos rivales ya tienen una referencia clara de lo que puede pasar si le conceden un metro.`,
				},
				{
					title: "Noche de inspiración: hat-trick y espectáculo",
					body: `${topScorer.player.name} encontró el camino del gol una y otra vez y cerró el encuentro con ${formatGoals(topScorer.goals)}. Una actuación de las que levantan al público y obligan al próximo rival a preparar un plan especial. Su olfato apareció en los momentos clave y cada acierto fue dando más confianza a su equipo. La próxima jornada dirá si fue una noche excepcional o el comienzo de una etapa especialmente inspirada.`,
				},
				{
					title: `${topScorer.player.name} firmó una noche para recordar`,
					body: `El hat-trick de ${topScorer.player.name} convirtió un buen partido en una actuación difícil de olvidar. Cada vez que el rival parecía encontrar la manera de contenerle, volvió a aparecer para cambiar el marcador. Sus compañeros celebran una victoria o una actuación colectiva más completa; la defensa contraria, en cambio, tendrá una semana para pensar cómo pudo dejarle tantas opciones.`,
				},
				{
					title: "Tres goles y una pregunta para la próxima jornada",
					body: `${topScorer.player.name} cerró el encuentro con ${formatGoals(topScorer.goals)} y se ganó todos los focos. El reto ahora es sostener esa confianza cuando los próximos rivales salgan con un plan pensado para vigilarle. Si consigue adaptarse a esa atención extra, su hat-trick puede ser el primer capítulo de una historia aún más larga.`,
				},
			);
		} else if (topScorer.goals === 2) {
			stories.push(
				{
					title: `${topScorer.player.name}, doblete para enmarcar`,
					body: `${scoringSummary} y fue uno de los grandes protagonistas del ${match.teamA.score}-${match.teamB.score}. Su doblete confirma que atraviesa un momento dulce de cara a portería. Los dos aciertos llegaron en una noche en la que supo elegir bien cuándo finalizar y cuándo asociarse con el equipo. La defensa rival tendrá que revisar cómo le permitió encontrar esas ocasiones antes del próximo cruce.`,
				},
				{
					title: "Dos golpes de autoridad",
					body: `${topScorer.player.name} firmó un doblete y dejó su sello en el partido. Ahora toca comprobar si esta actuación es el comienzo de una buena racha o una noche especialmente inspirada. Lo cierto es que encontró dos veces la manera de hacer daño y obligó al rival a ajustar su defensa. Con esa confianza renovada, cada nueva oportunidad tendrá un punto extra de expectación.`,
				},
				{
					title: `${topScorer.player.name} encontró la fórmula por partida doble`,
					body: `Dos veces apareció ${topScorer.player.name} para castigar al rival y cambiar el tono del encuentro. Su doblete habla de eficacia, pero también de saber estar en el lugar adecuado cuando la jugada lo pidió. La siguiente cita dirá si esta noche fue un destello o el comienzo de una serie de actuaciones con la portería entre ceja y ceja.`,
				},
			);
		} else {
			stories.push({
				title: `${topScorer.player.name} aparece en el momento importante`,
				body: `${scoringSummary} y dejó su huella en un encuentro que acabó ${match.teamA.score}-${match.teamB.score}. No necesitó una lluvia de goles para convertirse en uno de los nombres propios de la jornada. Su tanto añadió una pieza importante al marcador y dio a su equipo un motivo para creer en sus opciones. En partidos ajustados, una aparición puntual puede tener más valor que muchas ocasiones sin premio.`,
			});
			stories.push({
				title: `Una aparición, un gol y un partido marcado`,
				body: `${topScorer.player.name} solo necesitó una ocasión registrada para dejar su nombre en el marcador. En un partido que terminó ${match.teamA.score}-${match.teamB.score}, su acierto pudo ser decisivo para dar confianza a su equipo o mantenerlo con vida. No todas las actuaciones memorables necesitan una colección de goles: a veces basta con aparecer en el instante justo.`,
			});
		}

		if (isDraw) {
			stories.push(
				{
					title: `${topScorer.player.name} brilla, pero nadie consigue imponerse`,
					body: `${scoringSummary} en un empate ${match.teamA.score}-${match.teamB.score}. Su actuación pudo decantar la balanza, pero el rival resistió y el encuentro terminó con reparto de puntos. El goleador puso de su parte para que su equipo aspirara a más, aunque faltó ese último detalle que transforma una buena actuación en una victoria. Ambos se marchan con algo que celebrar y con la sensación de que había margen para llevarse los tres puntos.`,
				},
				{
					title: `El gol de ${topScorer.player.name} no rompe las tablas`,
					body: `${topScorer.player.name} encontró portería en un partido que acabó ${match.teamA.score}-${match.teamB.score}, pero ninguno logró inclinar definitivamente la balanza. Cada equipo tuvo argumentos para buscar la victoria y el empate terminó premiando la resistencia de ambos. El goleador puede quedarse con su acierto; los dos conjuntos, con la tarea pendiente de convertir el siguiente empate posible en tres puntos.`,
				},
			);
		} else if (scorerTeam === winner) {
			const streak = getWinningStreak(
				topScorer.player.id,
				match,
				previousMatches,
			);
			if (streak >= 2) {
				stories.push(
					{
						title: `${topScorer.player.name} suma ${streak} victorias consecutivas`,
						body: `${scoringSummary} y ayudó a ${winner} a ganar ${winnerScore}-${loserScore}. Con este resultado ya encadena ${streak} triunfos seguidos: está en racha y no parece dispuesto a levantar el pie. Su aportación volvió a aparecer en un momento decisivo y confirma que está siendo una pieza importante en esta serie. El próximo rival tendrá el reto de cortar la dinámica antes de que gane todavía más impulso.`,
					},
					{
						title: `${topScorer.player.name}, goles y una racha que no para`,
						body: `${topScorer.player.name} volvió a ser decisivo en la victoria de ${winner}. Ya son ${streak} partidos ganando consecutivamente. ¿Quién será capaz de poner fin a esta dinámica? La confianza del equipo crece con cada resultado y el goleador está encontrando la manera de aportar cuando más importa. La racha ya es un argumento propio, pero cada nueva jornada también trae una prueba distinta.`,
					},
					{
						title: `${winner} y ${topScorer.player.name} no levantan el pie`,
						body: `${topScorer.player.name} aportó en un nuevo triunfo de ${winner}, que ya suma ${streak} victorias seguidas. La serie empieza a llamar la atención y también a poner un objetivo en la espalda del equipo: todos querrán ser quienes la corten. Por ahora, el goleador y sus compañeros siguen respondiendo cada vez que aparece una nueva prueba.`,
					},
				);
			}
			stories.push({
				title: `${topScorer.player.name} lidera el triunfo`,
				body: `${scoringSummary} y fue una de las claves de la victoria de ${winner} por ${winnerScore}-${loserScore}. El equipo aprovechó mejor sus ocasiones y se lleva una jornada para celebrar. Su gol ayudó a construir una ventaja que el rival ya no pudo neutralizar, y el grupo supo proteger el resultado cuando más lo necesitaba. Un triunfo así refuerza la confianza y deja buenas sensaciones para el siguiente compromiso.`,
			});
			stories.push({
				title: `${winner} encontró en ${topScorer.player.name} la llave del partido`,
				body: `El gol de ${topScorer.player.name} ayudó a ${winner} a cerrar una victoria por ${winnerScore}-${loserScore}. En un encuentro que exigió respuestas, el equipo supo transformar sus momentos de ventaja en un resultado concreto y defenderlo hasta el final. El goleador se lleva el reconocimiento, aunque el triunfo también habla del trabajo colectivo para sostenerlo.`,
			});
		} else {
			stories.push(
				{
					title: `${topScorer.player.name} no encuentra premio`,
					body: `${scoringSummary}, pero ${winner} se llevó el partido por ${winnerScore}-${loserScore}. Su actuación mantuvo a su equipo con opciones, aunque esta vez el esfuerzo individual no bastó para evitar la derrota. El gol impidió que el marcador se escapara todavía más y mantuvo la esperanza durante buena parte del encuentro. Ahora toca transformar ese acierto en impulso colectivo para que la próxima vez el esfuerzo sí tenga premio.`,
				},
				{
					title: "Un goleador entre la frustración y el orgullo",
					body: `${topScorer.player.name} cumplió con su parte anotando ${formatGoals(topScorer.goals)}, pero el resultado cayó del lado de ${winner}. Se marcha con buenas sensaciones individuales y una derrota que todavía escuece. Su producción ofensiva fue una de las pocas noticias positivas de una tarde que dejó trabajo pendiente para el equipo. Habrá que rescatar lo que funcionó y corregir los detalles que permitieron al rival llevarse el triunfo.`,
				},
				{
					title: `El esfuerzo de ${topScorer.player.name} se queda corto`,
					body: `${topScorer.player.name} encontró la manera de hacer daño, pero no pudo evitar que ${winner} se llevara el partido. Su gol mantuvo la esperanza y demostró que todavía había una vía para volver al encuentro, aunque el equipo no logró completar la remontada. La actuación individual merece reconocimiento; el marcador, por ahora, deja una lección colectiva.`,
				},
			);
		}
	} else {
		stories.push({
			title: isDraw
				? `Reparto de puntos: ${match.teamA.score}-${match.teamB.score}`
				: `${winner} se impone ${winnerScore}-${loserScore}`,
			body: isDraw
				? `La jornada terminó en tablas con un ${match.teamA.score}-${match.teamB.score}. Ningún equipo logró abrir una diferencia definitiva y el reparto de puntos refleja la igualdad del encuentro. Hubo intentos por romper el empate, pero las defensas y la falta de acierto mantuvieron el marcador equilibrado. Los dos conjuntos suman y, al mismo tiempo, se quedan con la tarea de encontrar ese punto extra para convertir el próximo duelo en una victoria.`
				: `Victoria para ${winner} por ${winnerScore}-${loserScore}, con una diferencia de ${formatGoalDifference(scoreDifference)}. El resultado premia al equipo que mejor aprovechó sus oportunidades. ${loser} no pudo encontrar la respuesta necesaria para equilibrar el marcador y tendrá que revisar dónde se escapó el partido. ${winner}, en cambio, puede apoyarse en esta actuación para llegar con confianza a la siguiente jornada.`,
		});
		stories.push({
			title: isDraw
				? "Nadie se lleva el último pulso"
				: `${winner} convierte su ventaja en victoria`,
			body: isDraw
				? `El ${match.teamA.score}-${match.teamB.score} deja a los dos equipos con motivos para pensar que pudieron llevarse más. Hubo equilibrio en el marcador y ninguno encontró la acción definitiva para separarse. El empate mantiene la rivalidad abierta y deja el próximo enfrentamiento con cuentas pendientes.`
				: `${winner} supo proteger la diferencia y terminó celebrando el ${winnerScore}-${loserScore}. ${loser} buscó la forma de volver al partido, pero no encontró la combinación necesaria para cambiar el desenlace. La victoria premia la eficacia y deja al ganador con una base sobre la que construir la siguiente jornada.`,
		});
	}

	if (totalGoals >= 8) {
		stories.push(
			{
				title: "Festival de goles en la pista",
				body: `El marcador registró ${formatGoals(totalGoals)} en el ${match.teamA.score}-${match.teamB.score}. Fue un encuentro abierto, con ocasiones y emoción hasta el final. Los ataques se impusieron por momentos a las defensas. Cada gol cambió el pulso del partido y obligó al rival a volver a buscar respuestas, así que no faltaron alternativas ni momentos de tensión. Los entrenadores tendrán material de sobra para repasar; las defensas, quizá, preferirían pasar directamente a la siguiente jornada.`,
			},
			{
				title: "Las defensas pidieron tregua",
				body: `Con ${formatGoals(totalGoals)}, el partido fue un auténtico intercambio de golpes. Hubo goles para todos los gustos y el público disfrutó de un espectáculo ofensivo que deja mucho que comentar. Cuando un equipo parecía tomar aire, el otro encontraba la forma de responder y mantener viva la emoción. El marcador terminó siendo el resumen perfecto de una noche en la que atacar fue más fácil que guardar la puerta.`,
			},
			{
				title: "Una noche en la que el marcador no tuvo descanso",
				body: `${formatGoals(totalGoals)} en el ${match.teamA.score}-${match.teamB.score}: los ataques tuvieron respuesta para casi todo. Cada gol reabrió el partido o alimentó la ventaja, y los equipos apenas tuvieron tiempo para acomodarse antes de volver a buscar portería. El espectáculo estuvo servido; los cuerpos técnicos tendrán más de una jugada defensiva que revisar.`,
			},
		);
	}

	if (scoreDifference === 1) {
		stories.push(
			{
				title: "Decidido por un suspiro",
				body: `${winner} se llevó el encuentro por una mínima diferencia: ${winnerScore}-${loserScore}. La igualdad se mantuvo hasta el desenlace y cualquier pequeño detalle pudo haber cambiado el ganador. Cada posesión final tuvo aroma de sentencia y el equipo que mejor gestionó esos minutos terminó encontrando el premio. ${loser} estuvo cerca de rescatar algo, pero se marcha con la sensación de que un solo ajuste pudo cambiar la historia.`,
			},
			{
				title: "Victoria por la mínima, emoción máxima",
				body: `Solo un gol separó a los dos equipos en el ${winnerScore}-${loserScore}. ${winner} celebra, pero ${loser} se marcha con la sensación de haber estado muy cerca de rascar algo más. El margen fue mínimo y cualquier ocasión desaprovechada pesará en la revisión del partido. Para ${winner}, en cambio, esta victoria tan trabajada puede valer mucho por la manera en que supo resistir la presión.`,
			},
			{
				title: `${winner} resiste hasta el último detalle`,
				body: `El ${winnerScore}-${loserScore} dejó a ${winner} con una ventaja mínima y a ${loser} persiguiendo el empate hasta el final. Cada acción defensiva ganó importancia a medida que avanzaban los minutos, y el equipo ganador tuvo que sostener el resultado con concentración. No fue una victoria cómoda, pero sí una de esas que se recuerdan por lo mucho que costó.`,
			},
		);
	} else if (!isDraw && scoreDifference >= 4) {
		stories.push(
			{
				title: `${winner} firma una victoria contundente`,
				body: `${winner} se impuso por ${winnerScore}-${loserScore}, una diferencia de ${formatGoalDifference(scoreDifference)} que refleja su superioridad en el marcador. Un triunfo importante para ganar confianza. El equipo encontró espacios, sacó partido de sus ocasiones y obligó al rival a perseguir el resultado durante buena parte del encuentro. Si logra mantener esa intensidad en la próxima jornada, será un adversario difícil de frenar.`,
			},
			{
				title: "Golpe sobre la mesa",
				body: `${winner} no dejó lugar a dudas y cerró el partido con una ventaja de ${formatGoalDifference(scoreDifference)}. El resultado supone un aviso para sus próximos rivales. La diferencia fue creciendo mientras ${winner} mantenía el control y encontraba soluciones en ataque. ${loser} tendrá que pasar página y recuperar sensaciones; el ganador, en cambio, sale reforzado y con motivos para mirar con ambición al siguiente compromiso.`,
			},
			{
				title: `${loser} no logra contener el empuje de ${winner}`,
				body: `${winner} abrió una distancia de ${formatGoalDifference(scoreDifference)} y sostuvo su dominio hasta el final. ${loser} tuvo que perseguir el marcador y no encontró la reacción suficiente para cambiar el rumbo del partido. El ganador se lleva una actuación convincente; el equipo derrotado tendrá que recomponerse y buscar respuestas antes del próximo compromiso.`,
			},
		);
	}

	const scorers = new Set(match.goals.map((goal) => goal.playerId));
	if (scorers.size >= 3) {
		stories.push({
			title: "El protagonismo estuvo muy repartido",
			body: `Al menos tres jugadores distintos encontraron portería en este encuentro. ${match.teamA.score}-${match.teamB.score} fue el resultado de un esfuerzo colectivo en el que no todo dependió de una sola estrella. Repartir el peligro obligó al rival a vigilar varios frentes y dificultó que pudiera concentrarse en una única referencia. Esa variedad ofensiva puede ser una gran noticia de cara a los próximos partidos.`,
		});
		stories.push({
			title: "Varias voces se sumaron al marcador",
			body: `El resultado de ${match.teamA.score}-${match.teamB.score} tuvo más de un protagonista: al menos tres jugadores distintos aportaron goles. Esa variedad dio al equipo alternativas para atacar y evitó que toda la responsabilidad recayera en una sola figura. Cuando varias piezas encuentran portería, el rival tiene más problemas para decidir a quién vigilar.`,
		});
	}

	const winningPlayers = isTeamAWinner
		? match.teamA.players
		: match.teamB.players;
	if (!isDraw) {
		const hottestWinner = [...winningPlayers]
			.map((player) => ({
				player,
				streak: getWinningStreak(player.id, match, previousMatches),
			}))
			.sort((a, b) => b.streak - a.streak)[0];

		if (hottestWinner && hottestWinner.streak >= 3) {
			stories.push({
				title: `${hottestWinner.player.name} alcanza las ${hottestWinner.streak} victorias seguidas`,
				body: `${hottestWinner.player.name} celebró otro triunfo y amplía su racha personal hasta ${hottestWinner.streak} victorias consecutivas. La pregunta ya no es si está en forma, sino quién podrá detener esta dinámica. Cada partido añade confianza y convierte la próxima cita en una nueva oportunidad para seguir estirando la serie. Los rivales ya tienen un objetivo claro, aunque frenar una racha así exige algo más que buenas intenciones.`,
			});
			stories.push({
				title: `${hottestWinner.player.name} sigue sumando y no afloja`,
				body: `${hottestWinner.player.name} vuelve a ganar y eleva su cuenta a ${hottestWinner.streak} victorias consecutivas. La racha empieza a ser una historia dentro de la temporada, con cada encuentro como un nuevo examen. Sus próximos rivales ya saben qué tienen entre manos: si quieren detenerla, tendrán que encontrar la manera de sacarle de su zona de confianza.`,
			});
		}
	}

	const recentHatTrick = getRecentHatTrick(
		players,
		previousMatches,
		match.seasonId ?? null,
	);
	if (recentHatTrick && !topScorer) {
		stories.push({
			title: `${recentHatTrick.player.name} no pudo repetir su última exhibición`,
			body: `Después de firmar un hat-trick en su último partido, ${recentHatTrick.player.name} llegaba con expectativas altas. Esta vez no aparece entre los goleadores registrados: el rival consiguió reducir su influencia. La vigilancia extra y la falta de espacios le dejaron menos opciones para repetir aquella exhibición, aunque su presencia siguió condicionando la atención defensiva. El reto ahora será recuperar protagonismo y demostrar que puede influir en el partido incluso cuando no encuentra portería.`,
		});
		stories.push({
			title: `La defensa aprendió la lección ante ${recentHatTrick.player.name}`,
			body: `${recentHatTrick.player.name} venía de marcar tres veces, pero esta vez el rival consiguió mantenerle lejos del marcador. La atención sobre sus movimientos fue mayor y los espacios para rematar, mucho menores. No repetir el hat-trick no borra su última actuación: ahora queda por ver cómo se adapta cuando los defensores ya preparan el partido pensando en él.`,
		});
	}

	return pickNews(
		stories.map((story) =>
			personalizeMatchStory(story, match, previousMatches),
		),
	);
}
