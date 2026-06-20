<!DOCTYPE html>
<html>
<head>
    <title>Anime Info</title>
</head>
<body>
    <h1 id="title"></h1>
    <img id="image" src="">
    <p id="synopsis"></p>

    <script>
        fetch("https://api.jikan.moe/v4/anime/21/full")
            .then(res => res.json())
            .then((out) => {
                console.log('Output: ', out);
                let anime = out.data;
                //encontrar e adicionar paragrafo com o nome do anime
                let title = document.getElementById("title");
                title.innerHTML = anime.title;

                //busca imagens da API
                let images = anime.images;
                //buscar URL imagem grande
                let large_image = images.jpg.large_image_url;
                console.log(large_image);

                //encontrar tag img no HTML
                let image = document.getElementById("image");
                //meter no src de img o URL da imagem da API
                image.src = large_image;

                //sinopse tirada da API
                let syn = anime.synopsis;
                //buscar paragrafo com id synopsis
                let synopsis = document.getElementById("synopsis");
                synopsis.innerHTML = syn;
            }).catch(err => console.error(err));
    </script>
</body>
</html>