let page = 1;
let maxPage;
let scrollinfinite;
let lang;

//Lenguaje
const lenguaje = document.querySelector(".form-select");
lenguaje.addEventListener("change", language);

function language() {
    lang = lenguaje.value;
    console.log(lang);
    if (lang == "es") {
        document.querySelector(".trendingPreview-title").textContent = "Tendencia";
        document.querySelector(".categoriesPreview-title").textContent = "Categorias";
        trendingBtn.textContent = "Ver más";
    }else if (lang == "en"){
        document.querySelector(".trendingPreview-title").textContent = "Trending";
        document.querySelector(".categoriesPreview-title").textContent = "Categories";
        trendingBtn.textContent = "See more";
    }else{
        document.querySelector(".trendingPreview-title").textContent = "Tendance";
        document.querySelector(".categoriesPreview-title").textContent = "Catégories";
        trendingBtn.textContent = "Voir plus";
    }
    homePage();
};
//Api
const API = axios.create({
    baseURL: "https://api.themoviedb.org/3/",
    headers: {
        "Content-Type": "application/json;charset=utf-8",
    },
    params: {
        "api_key": API_KEY,
        "language": lang
        
    },
});

searchFormBtn.addEventListener("click", ()=>{
    location.hash = `#search=${searchFormInput.value}`;
    console.log(searchFormInput.value);
});

trendingBtn.addEventListener("click", ()=>{
    location.hash = "#trends";
});
/* Si quisieramos abrir desde youtube la aplicación en un hash que no sea el home y cuando tocamos el boton atras vuelva al home en lugar de a youtube: window.addEventListener(
    'DOMContentLoaded',
    () => {
        navigator();
        // Agregando un estado de carga inical
        window.history.pushState({ loadUrl: window.location.href }, null, '');
    },
    false,
);
arrowBtn.addEventListener("click", ()=>{
    const stateLoad = window.history.state ? window.history.state.loadUrl : '';
    console.log(stateLoad);
    if (stateLoad.includes('#')) {
        window.location.hash = '';
        console.log("no aplica el back");
    } else {
        window.history.back();
    }
});
*/
arrowBtn.addEventListener("click", ()=>{
    window.history.back();
});

window.addEventListener("DOMContentLoaded", navigator, false);
window.addEventListener("hashchange", navigator, false);



// getPaginetedTrendingMovies

function navigator(){

    
    console.log({location});
    
    if(location.hash.startsWith("#trends")){
        trendPage();

    } else if (location.hash.startsWith("#search=")){
        searchPage();

    } else if (location.hash.startsWith("#movie=")){
        movieDetailsPage();

    }else if (location.hash.startsWith("#category=")){
        categoriesPage();
    } else {
        homePage();
    };
    window.scrollTo(0, 0);
    //Para que al cambiar de pagina siempre arranque la visión arriba de la pantalla.
    

     if (scrollinfinite) {
         window.addEventListener("scroll", scrollinfinite);
     };

};

function homePage(){
    //Estas lineas de código con add y remove en realidad no hacen falta porque por defecto ya estan asi en el html, no estamos modificando nada. 
    headerSection.classList.remove("header-container--long");
    headerSection.style.background = "";
    arrowBtn.classList.add("inactive");
    arrowBtn.classList.remove("header-arrow--white");
    headerTitle.classList.remove("inactive")
    headerCategoryTitle.classList.add("inactive");
    searchForm.classList.remove("inactive");

    trendingPreviewSection.classList.remove("inactive");
    categoriesPreviewSection.classList.remove("inactive");
    likedMoviesSection.classList.remove("inactive");
    genericSection.classList.add("inactive");
    movieDetailSection.classList.add("inactive");

    
    getTrendingMoviesPreview();
    getCategoriesPreview();
    getLikedMovies();
};


function categoriesPage(){
    headerSection.classList.remove("header-container--long");
    // headerSection.style.background = "";
    arrowBtn.classList.remove("inactive");
    arrowBtn.classList.remove("header-arrow--white");
    headerTitle.classList.add("inactive")
    headerCategoryTitle.classList.remove("inactive");
    searchForm.classList.add("inactive");
    
    trendingPreviewSection.classList.add("inactive");
    categoriesPreviewSection.classList.add("inactive");
    likedMoviesSection.classList.add("inactive");
    genericSection.classList.remove("inactive");
    movieDetailSection.classList.add("inactive");

    const [ , categoryData] = location.hash.split("="); 
    //Split transforma un string en un array. Luego uso la destructuración en la constante para guardar los valores de los dos elementos del array. En este caso [#category] [id-name] en vez de tener que guardar en dos constantes distintas. Como el primer array no lo uso puedo no poner ningún nombre y dejo el espacio vacio.
    const [categoryId, categoryName] = categoryData.split("-");
    
    headerCategoryTitle.innerHTML = categoryName;

    getMoviesByCategory(categoryId);
    scrollinfinite = getPaginetedCategory(categoryId);

};

function movieDetailsPage(){
    headerSection.classList.add("header-container--long");
    // headerSection.style.background = "";
    arrowBtn.classList.remove("inactive");
    arrowBtn.classList.add("header-arrow--white");
    headerTitle.classList.add("inactive")
    headerCategoryTitle.classList.add("inactive");
    searchForm.classList.add("inactive");
    
    trendingPreviewSection.classList.add("inactive");
    categoriesPreviewSection.classList.add("inactive");
    likedMoviesSection.classList.add("inactive");
    genericSection.classList.add("inactive");
    movieDetailSection.classList.remove("inactive");
    footer.classList.add("inactive");

   
    let [ , movieId] = location.hash.split("=");
    movieId = movieId.replaceAll("%20", "");

    getMovieById(movieId);
};

function searchPage(){
    headerSection.classList.remove("header-container--long");
    // headerSection.style.background = "";
    arrowBtn.classList.remove("inactive");
    arrowBtn.classList.remove("header-arrow--white");
    headerTitle.classList.add("inactive")
    headerCategoryTitle.classList.add("inactive");
    searchForm.classList.remove("inactive");
    
    trendingPreviewSection.classList.add("inactive");
    categoriesPreviewSection.classList.add("inactive");
    likedMoviesSection.classList.add("inactive");
    genericSection.classList.remove("inactive");
    movieDetailSection.classList.add("inactive");

    //Si buscamos una pelicula que tenga un nombre con más de una palabra en los espacios va a aparecer "%20" y va a darnos error. Para eliminar esto se puede usar el decodeURI o también el código de la opción comentada.
    // let [ , query] = location.hash.split("=");
    // query = decodeURI(query)
    // getMoviesBySearch(query);
    
    let a = location.hash.split("=")[1];
    a = a.replaceAll("%20", " ");

    getMoviesBySearch(a);
    scrollinfinite = getPaginetedSearch(a);

};

function trendPage(){
    headerSection.classList.remove("header-container--long");
    // headerSection.style.background = "";
    arrowBtn.classList.remove("inactive");
    arrowBtn.classList.remove("header-arrow--white");
    headerTitle.classList.add("inactive")
    headerCategoryTitle.classList.remove("inactive");
    searchForm.classList.add("inactive");
    
    trendingPreviewSection.classList.add("inactive");
    categoriesPreviewSection.classList.add("inactive");
    likedMoviesSection.classList.add("inactive");
    genericSection.classList.remove("inactive");
    movieDetailSection.classList.add("inactive");

    headerCategoryTitle.innerHTML = "Tendencias";
    
    getTrendingMovies();
    scrollinfinite = getPaginetedTrending();
};
