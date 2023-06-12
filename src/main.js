//Util
const lazyLoader = new IntersectionObserver((entries)=>{
    entries.forEach((entry)=>{
        if(entry.isIntersecting){
           const Url = entry.target.getAttribute("data-img");
           entry.target.setAttribute("src", Url);
           lazyLoader.unobserve(entry.target);
        }
    })
});

function likedMovieList() {
    const item = JSON.parse(localStorage.getItem("liked_movies"));
    let movies;

    if(item){
        movies = item; 
    } else{
        movies = {};
    }
    return movies;
};

function likeMovie(movie){
    const likedMovies = likedMovieList();
    
    if(likedMovies[movie.id]){
        likedMovies[movie.id] = undefined;
    }else{
        likedMovies[movie.id] = movie;
    };
    localStorage.setItem("liked_movies", JSON.stringify(likedMovies));
};


//Función para no repetir código.
function createMovie(movies, container, {lazyLoad = false, clean = true}={}) { 
    if (clean){
        container.innerHTML = "";
    };

    movies.forEach((movie)=>{
        
        const movieContainer = document.createElement("div");
        movieContainer.classList.add("movie-container");
                
        const movieImg = document.createElement("img");
        movieImg.classList.add("movie-img");
        movieImg.setAttribute("alt", movie.title);
        movieImg.setAttribute(
            lazyLoad? "data-img": "src", `https://image.tmdb.org/t/p/w300${movie.poster_path}`);
        /*
         Para escuchar el evento de error en una imagen y reemplazarlo por alguna otra imagen
        movieImg.addEventListener("error", ()=>{
        movieContainer.setAttribute("src", "url");   
        
        Tambien podemos eliminar la foto que genera el error para que no se vea si ponemos:
        movieContainer.remove(movieImg);
        });*/

        movieImg.addEventListener("click", ()=>{
            location.hash = `#movie=${movie.id}`
        });

        const movieBtn = document.createElement("button");
        movieBtn.classList.add("movie-btn");
        likedMovieList()[movie.id] && movieBtn.classList.add("movie-btn--liked");

        movieBtn.addEventListener("click", ()=>{
            movieBtn.classList.toggle("movie-btn--liked");
            likeMovie(movie);
            homePage();
        });

        
        if(lazyLoad){
            lazyLoader.observe(movieImg)};

        movieContainer.append(movieImg, movieBtn);

        container.appendChild(movieContainer);
        
    });

};

function createCategories(categories, container) {
    container.innerHTML = "";

    categories.forEach((genero)=>{

        const categoryContainer = document.createElement("div");
        categoryContainer.classList.add("category-container");
        
        const titleCategory = document.createElement("h3");
        titleCategory.setAttribute("id", `id${genero.id}`);
        titleCategory.classList.add("category-title");
        titleCategory.addEventListener("click", ()=>{
            location.hash = `#category=${genero.id}-${genero.name}`;
        });

        const titleText = document.createTextNode(genero.name);
        console.log(genero.name);

        titleCategory.appendChild(titleText);
        categoryContainer.appendChild(titleCategory);
        container.appendChild(categoryContainer);

});
};

//Llamados a la API.
async function getTrendingMoviesPreview (){
    const { data } = await API(`trending/movie/day`, {
        params: {
        "api_key": API_KEY,
        "language": lang
        
    },
    });
    const movies = data.results;

    createMovie(movies, trendingMoviesPreviewList, {lazyLoad : true});

    console.log({data, movies});
};

async function getCategoriesPreview (){
    const { data } = await API(`genre/movie/list`, {
        params: {
            "api_key": API_KEY,
            "language": lang
            
        },
    });
    
    const generos = data.genres;

    createCategories(generos, categoriesPreviewList);

    
};

async function getMoviesByCategory (id){
    const { data } = await API(`discover/movie/`, {
        params: {
            with_genres: id,
        },
    });
    const movies = data.results;
    
    createMovie(movies, genericSection, {lazyLoad : true});

    console.log({data, movies});
};

async function getMoviesBySearch (query){
    const { data } = await API(`search/movie`, {
        params: {
            query,
        },
    });
    const movies = data.results;
    maxPage = data.total_pages;

    createMovie(movies, genericSection, {lazyLoad : true});

    console.log({data, movies});
};

async function getTrendingMovies (){
    const { data } = await API(`trending/movie/day`, {
        params: {
            "api_key": API_KEY,
            "language": lang
            
        },
    });
    const movies = data.results;

    maxPage = data.total_pages;

    createMovie(movies, genericSection, {lazyLoad: true, clean: true});

    
};

async function getMovieById (movieId){
    const { data } = await API(`movie/${movieId}`);
    
    //Al data_averege que es la puntuación de la peli le dejo solo un decimal con el toFixed.
    let score = data.vote_average.toFixed(1);
    
    movieDetailTitle.textContent = data.title;
    movieDetailDescription.textContent = data.overview;
    movieDetailScore.textContent = score;

    createCategories(data.genres, movieDetailCategoriesList);

    console.log(data);
    const movieImgUrl = `https://image.tmdb.org/t/p/w500${data.poster_path}`;
    headerSection.style.background = `
    linear-gradient(
        180deg, 
        rgba(0, 0, 0, 0.35) 
        19.27%, rgba(0, 0, 0, 0) 29.17%),
    url(${movieImgUrl})`;
    
     getSimilarMoviesId(movieId);
};

async function getSimilarMoviesId(id) {
     const {data} = await API(`movie/${id}/similar`)
    const similarMovies = data.results;

    createMovie(similarMovies, relatedMoviesContainer, {lazyLoad : true});
 };

function getPaginetedSearch (query){
    return async function(){
        const {scrollTop, clientHeight, scrollHeight} = document.documentElement;
    
        const scrollIsBottom = (scrollTop + clientHeight) >= (scrollHeight - 15);
        const pageIsNotMax = page < maxPage;
    
        if(scrollIsBottom && pageIsNotMax){
            page++;
            const { data } = await API(`search/movie`, {
                params: {
                query,
                 page,
                },
            });
            
            const movies = data.results;
        
            createMovie(movies, genericSection, {lazyLoad: true, clean: false});
        };
    };


 };

async function getPaginetedTrending (){
    
    const {scrollTop, clientHeight, scrollHeight} = document.documentElement;
    
    const scrollIsBottom = (scrollTop + clientHeight) >= (scrollHeight - 15);
    const pageIsNotMax = page < maxPage;
    
    if(scrollIsBottom && pageIsNotMax){
        page++;
        const { data } = await API(`trending/movie/day`, {
        params: {
         page,
        },
    });
                
    const movies = data.results;
            
    createMovie(movies, genericSection, {lazyLoad: true, clean: false});
    };  
};

function getPaginetedCategory (categoryId){
    return async function(){
        const {scrollTop, clientHeight, scrollHeight} = document.documentElement;
    
        const scrollIsBottom = (scrollTop + clientHeight) >= (scrollHeight - 15);
        const pageIsNotMax = page < maxPage;
    
        if(scrollIsBottom && pageIsNotMax){
            page++;
            const { data } = await API(`discover/movie/`, {
            params: {
                with_genres: categoryId,
                page,
            },
            });
            
            const movies = data.results;
        
            createMovie(movies, genericSection, {lazyLoad: true, clean: false});
        };
    };
};

function getLikedMovies(){
    const likedMovies = likedMovieList();
    console.log(likedMovies);
    const moviesArray = Object.values(likedMovies);
    console.log(moviesArray);
    
    createMovie(moviesArray, likedMovieListArticle, {lazyLoad: true, clean: true});
};

