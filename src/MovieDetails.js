import { useState, useEffect, useRef } from "react";

import StarRating from "./StarRating";
import { useKey } from "./useKey";

const KEY = "647f7439";

function Loader() {
	return <p className="loader">Loading...</p>;
}

export default function MovieDetails({
	selectedId,
	onCloseMovie,
	onAddWatched,
	watched,
}) {
	const [movie, setMovie] = useState({});
	const [isLoading, setIsLoading] = useState(false);
	const [userRating, setUserRating] = useState("");

	// store amount of clicks on rating before movie was added, but we dont want to re-render
	const countRef = useRef(0);
	//not allowed to mutate ref in render logic, so we use effect:
	useEffect(
		function () {
			if (userRating) countRef.current++;
		},
		[userRating]
	);

	const isWatched = watched
		.map((movie) => movie.imdbID)
		.includes(selectedId);

	const watchedUserRating = watched.find(
		(movie) => movie.imdbID === selectedId
	)?.userRating;

	const {
		Title: title,
		Year: year,
		Poster: poster,
		Runtime: runtime,
		imdbRating,
		Plot: plot,
		Released: released,
		Actors: actors,
		Director: director,
		Genre: genre,
	} = movie;

	function handleAdd() {
		const newWatchedMovie = {
			imdbID: selectedId,
			title,
			year,
			poster,
			imdbRating: Number(imdbRating),
			runtime: Number(runtime.split(" ").at(0)),
			userRating,
			countRatingDecisions: countRef.current,
		};

		onAddWatched(newWatchedMovie);
		onCloseMovie();
	}

	// Getting movie from API
	useEffect(
		function () {
			async function getMovieDetails() {
				setIsLoading(true);
				const res = await fetch(
					`http://www.omdbapi.com/?i=${selectedId}&apikey=${KEY}`
				);
				const data = await res.json();
				setMovie(data);
				setIsLoading(false);
			}
			getMovieDetails();
		},
		[selectedId]
	);

	// Listening keypress = ESC to close movie details (custom hook)
	useKey("Escape", onCloseMovie);

	// Change title of page depending on selected movie
	useEffect(
		function () {
			if (!title) return;
			document.title = `Movie | ${title}`;

			return function () {
				document.title = "usePopcorn";
			};
		},
		[title]
	);

	return (
		<div className="details">
			{isLoading ? (
				<Loader />
			) : (
				<>
					<header>
						<button className="btn-back" onClick={onCloseMovie}>
							&larr;
						</button>
						<img src={poster} alt={`Poster of ${movie} movie`} />
						<div className="details-overview">
							<h2>{title}</h2>
							<p>
								{released} &bull; {runtime}
							</p>
							<p>{genre}</p>
							<p>
								<span>⭐</span> {imdbRating} IMDb rating
							</p>
						</div>
					</header>
					<section>
						<div className="rating">
							{!isWatched ? (
								<>
									<StarRating
										maxRating={10}
										size={"24"}
										onSetRating={setUserRating}
									/>
									{userRating > 0 && (
										<button className="btn-add" onClick={handleAdd}>
											+ Add to list
										</button>
									)}
								</>
							) : (
								<p>You rated this movie {watchedUserRating}⭐</p>
							)}
						</div>
						<p>
							<em>{plot}</em>
						</p>
						<p>Staring: {actors}</p>
						<p>Directed by {director}</p>
					</section>
				</>
			)}
		</div>
	);
}
