import React, {useState, useEffect} from 'react'
import Search from "./components/Search.jsx";
import MovieCard from './components/MovieCard.jsx';
import {useDebounce} from 'react-use'
import { getTrendingMovies, updateSearchCount } from './appwrite.js';

const API_BASE_URL = 'https://api.themoviedb.org/3';

const API_KEY = import.meta.env.VITE_TMDB_API_KEY;

const API_OPTIONS = {
    method: 'GET',
    headers: {
        accept: 'application/json',
        Authorization: `Bearer ${API_KEY}`
    }
}

const App = () => {
    const [searchTerm, setSearchTerm] = useState('')
    const [errorMessage, seterrorMessage] = useState('')
    const [movieList, setmovieList] = useState([])
    const [trendingMovies, setTrendingMovies] = useState([])
    const [isLoading , setisLoading ] = useState(false)
    const [debounceSearchTerm, setDebounceSearchTerm] = useState('')


    // Debounce
    useDebounce( () => setDebounceSearchTerm(searchTerm), 500, [searchTerm])

    const fetchMovies = async (query = '') => {
        setisLoading(true)
        seterrorMessage('')
        
        try {
            const endpoint = query 
            ? `${API_BASE_URL}/search/movie?query=${encodeURIComponent(query)}`
            : `${API_BASE_URL}/discover/movie?sort_by=popularity.desc`

            const response = await fetch (endpoint, API_OPTIONS)

            if (!response) {
                throw new Error(`Failed`)
            }

            const data = await response.json()

           if(data.Response === 'False') {
            seterrorMessage(data.Error || 'Failed to fetch movies')
            setmovieList([])
            return;
           }

           setmovieList(data.results || []);

           if(query && data.results.length > 0) {
            await updateSearchCount(query, data.results[0])
           }
        } catch (error) {
            console.log(`Error fetching movies: ${error}`)
            seterrorMessage('Error fetching movies. Please try again later.')
        } finally {
            setisLoading(false)
        }
    }

    const loadTrendingMovies = async () => {
        try {
            const movies = await getTrendingMovies();

            setTrendingMovies(movies);
        } catch (error) {
            console.error(`Error fetching trending movies: ${error}`)
        }
    }

    useEffect(() => {
        fetchMovies(debounceSearchTerm)
    }, [debounceSearchTerm]);

    useEffect(() =>{
        loadTrendingMovies();
    },[])
    

    return (
        <main>
            <div className="pattern" />

            <div className="wrapper">
                <header>

                    <img src='./hero.png' alt='hero'/>
                    <h1>Find <span className='text-gradient'>Movies</span> You'll Enjoy Without Hassle</h1>
                    <Search searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
                </header>

                {trendingMovies.length > 0 && (
                    <section className='trending'>
                        <h2>Trending Movies</h2>

                        <ul>
                            {trendingMovies.map((movie, index)=>(
                                <li key={movie.$id}>
                                    <p>{index + 1}</p>
                                    <img src={movie.poster_url} alt={movie.title} />
                                </li>
                            ))}
                        </ul>
                    </section>
                )}

                <section className='all-movies'>
                    <h2>All Movies</h2>

                    {isLoading ? (
                        <Search />
                    ) : errorMessage ? (
                        <p className='text-red-500'>{errorMessage}</p>
                    ) : (
                        <ul>
                            {movieList.map((movie) => (
                                <MovieCard key={movie.id} movie={movie} />
                            ))}
                        </ul>
                    )}
                </section>
            </div>
        </main>
    )
}
export default App

