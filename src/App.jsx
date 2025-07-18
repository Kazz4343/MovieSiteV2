import React, {useState, useEffect} from 'react'
import Search from "./components/Search.jsx";
import Spinner from "./components/Spinner.jsx";

const API_BASE_URL =  "https://api.themoviedb.org/3"
const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const API_OPTIONS = {
    method:'GET',
    headers:{
        accept: 'application/json',
        Authorization: `Bearer ${API_KEY}`
    }
}

const App = () => {
    const [searchTerm, setSearchTerm] = useState('')
    const [errorMessage, setErrorMessage] = useState('')
    const [movielist, setMovielist] = useState([])
    const [isLoading, setIsLoading] = useState(false)

    const fetchMovies = async () => {
       setIsLoading(true);
        setErrorMessage('');
        try {
            const endpoint = `${API_BASE_URL}/discover/movie?sort_by=popularity.desc`

            const response = await fetch(endpoint, API_OPTIONS);

            if (!response.ok) {
                throw new Error(`Failed to fetch movies.`)
            }

            const data = await response.json()

            if (data.Response === 'false') {
                setErrorMessage(data.Error || 'Failed to fetch movies');
                setMovielist([]);
                return;
            }

            setMovielist(data.results || []);
        } catch (error) {
            console.log(`Error fetching movies: ${error}`)
            setErrorMessage(`Error fetching movies. Please try again later.`);
        }   finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        fetchMovies()
    }, []);

    return (
        <main>
            <div className="pattern" />
            <div className="wrapper">
                <header>
                    <img src="/hero.png" alt="HERO BANNER" />
                    <h1>Find <span className="text-gradient">Movies</span> You'll Enjoy Without the Hassle</h1>

                    <Search searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
                </header>

                <section className="all-movies">
                    <h2>All Movies</h2>

                    {isLoading ? (
                        <p className="text-white"><Spinner /></p>
                    ) : errorMessage ? (
                        <p className='text-red-500'>{errorMessage}</p>
                    ): (
                        <ul>
                            {movielist.map((movie) => (
                                <p key={movie.id} className='text-white'>{movie.title}</p>
                                ))}
                        </ul>
                    )}
                </section>
            </div>
        </main>
    )
}
export default App
