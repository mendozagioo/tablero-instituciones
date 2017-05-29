function getURLParameter(name) {
    return decodeURIComponent((new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(location.search) || [null, '-'])[1].replace(/\+/g, '%20')) || null;
}

function omitirAcentos(orgName) {
    var acentos = "ÃÀÁÄÂÈÉËÊÌÍÏÎÒÓÖÔÙÚÜÛãàáäâèéëêìíïîòóöôùúüûÑñÇç";
    var original = "AAAAAEEEEIIIIOOOOUUUUaaaaaeeeeiiiioooouuuunncc";
    for (var i = 0; i < acentos.length; i++) {
        orgName = orgName.replace(acentos.charAt(i), original.charAt(i));
    }
    return orgName, getapiOrg(orgName);
}

function getapiOrg(orgName) {
    var totalCalidad, percentRecommen, percentCalidad, dataApi, dataApiOPI, dataDescargasOpi, orgTitle, orgLogoUrl,
        downloads, adelaIssued, resourceId, rating, totalRaiting, resourceTitle, resourceType;
    var valueDownloads = [];
    var issuedTotal = 0;
    var issuedPublish = 0;
    var sumaRating = 0;
    var sumaCalidad = 0;
    var isPublicTrue = 0;
    var isPublicFalse = 0;
    var totalRecommendations = 0;

    //Ajax Get
    $.ajax({
        //url: 'http://api.datos.gob.mx/v1/data-fusion?catalog-dataset.publisher.name=SHCP&pageSize=1000',
        url: 'https://api.datos.gob.mx/v1/data-fusion?adela.inventory.slug=' + orgName,
        async: false,
        type: 'GET',
        success: function (data) {
            dataApi = data;
        },
        error: function (data) {
            console.error("Error!", data);
        }
    });
    $.ajax({
        url: '/tablero-instituciones/apicomparativa/' + orgName + '/',
        async: false,
        type: 'GET',
        success: function (data) {
            dataApiOPI = data;
        },
        error: function (data) {
            console.error("Error!", data);
        }
    });
    $.ajax({
        url: '/tablero-instituciones/apicomparativa/recursos-mas-descargados/' + orgName + '/',
        async: false,
        type: 'GET',
        success: function (data) {
            dataDescargasOpi = data;
        },
        error: function (data) {
            console.error("Error!", data);
        }
    });
    orgLogoUrl = 'https://raw.githubusercontent.com/mxabierto/assets/master/img/logos/' + orgName + '.png';
    $('#logo_org').attr('src', orgLogoUrl);
    var monthNames = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sept", "Oct", "Nov", "Dic"];
    var calidad_calif = ["N/A", "Bronce", "Plata", "Oro"];
    $.each(dataApi.results, function (key, value) {
        //Recorre IDs de recursos en Adela
        resourceId = value.adela.dataset.id;
        //Obtengo Titulo
        resourceTitle = value.adela.dataset.title;
        totalRecommendations = totalRecommendations + value.recommendations.length;
        //Recorre recomendaciones
        $.each(value.recommendations, function (key, value) {
            var recommendations = value;
            var nameError = "";
            var urlError = "";
            if (recommendations["more-info"]) {
                nameError = recommendations.name;
                urlError = recommendations["more-info"];

            } else {
                nameError = "";
                urlError = "";
            }
            var html = '';
            html += '<tr><td>' + recommendations.categoria + '</td><td><a href="/conjuntos/' + resourceId + '/edit">' + resourceTitle + '</a></td><td><a href="' + urlError + '">' + nameError + '</a></td><td><a href="#">Notifica</a></td></tr>';
            $('#table-recommendations tr').first().after(html);
        });
    });
    //Obtengo public
    var isPublicTrue = dataApiOPI.publicos,
        isPublicFalse = dataApiOPI.privados;
    $("#calidadDatosHtml").text(dataApiOPI.calidad.charAt(0).toUpperCase() + dataApiOPI.calidad.slice(1));
    $("#stars-raiting").attr("data-rating", dataApiOPI.apertura);
    $('#issuedTotal').text('/' + dataApiOPI.total);
    $('#issuedPublish').text(dataApiOPI.publicados);
    //Función para obtener el top 5 de descargas
    function getTopN(arr, prop, n) {
        // clone before sorting, to preserve the original array
        var clone = arr.slice(0);
        // sort descending
        clone.sort(function (x, y) {
            if (x[prop] == y[prop]) return 0;
            else if (parseInt(x[prop]) < parseInt(y[prop])) return 1;
            else return -1;
        });
        return clone.slice(0, n || 1);
    }

    var n = 5;
    var topScorers = dataDescargasOpi.recursos;
    topScorers.forEach(function (item, index) {
        var dateDownload = new Date(item.date_insert);
        var day = dateDownload.getDate();
        var monthIndex = dateDownload.getMonth();
        var year = dateDownload.getFullYear();
        var htmlDown = '';
        // console.log(item);
        if (item.descargas > 0) {
            htmlDown += '<tr><td><a href="https://datos.gob.mx/busca/dataset/' + item.dataset + '/resource/' + item.id + '" >' + item.recurso + '</a></td><td>' + item.actualizacion + '</td><td class="text-center">' + item.descargas + '</td></tr>';
            $('#table-downloads tr').last().after(htmlDown);
        }
    });
    /////Raiting
    (function ($) {
        $.fn.rating = function (method, options) {
            method = method || 'create';
            // This is the easiest way to have default options.
            var settings = $.extend({
                // These are the defaults.
                limit: 5,
                value: 0,
                glyph: "glyphicon-star",
                coloroff: "#D8D8D8",
                coloron: "#00CC99",
                size: "2.5em",
                cursor: "default",
                onClick: function () {
                },
                endofarray: "idontmatter"
            }, options);
            var style = "";
            style = style + "font-size:" + settings.size + "; ";
            style = style + "color:" + settings.coloroff + "; ";
            style = style + "cursor:" + settings.cursor + "; ";
            style = style + "margin: 0 7px;";
            if (method == 'create') {
                //this.html('');  //junk whatever was there
                //initialize the data-rating property
                this.each(function () {
                    attr = $(this).attr('data-rating');
                    if (attr === undefined || attr === false) {
                        $(this).attr('data-rating', settings.value);
                    }
                });
                //bolt in the glyphs
                for (var i = 0; i < settings.limit; i++) {
                    this.append('<span data-value="' + (i + 1) + '" class="ratingicon glyphicon ' + settings.glyph + '" style="' + style + '" aria-hidden="true"></span>');
                }
                //paint
                this.each(function () {
                    paint($(this));
                });
            }
            if (method == 'set') {
                this.attr('data-rating', options);
                this.each(function () {
                    paint($(this));
                });
            }
            if (method == 'get') {
                return this.attr('data-rating');
            }
            function paint(div) {
                rating = parseInt(div.attr('data-rating'));
                div.find("input").val(rating);  //if there is an input in the div lets set it's value
                div.find("span.ratingicon").each(function () {  //now paint the stars
                    var rating = parseInt($(this).parent().attr('data-rating'));
                    var value = parseInt($(this).attr('data-value'));
                    if (value > rating) {
                        $(this).css('color', settings.coloroff);
                    }
                    else {
                        $(this).css('color', settings.coloron);
                    }
                })
            }
        };
    }(jQuery));
    $(document).ready(function () {
        $("#stars-raiting").rating('create', {coloron: '#00CC99'});
    });
    ///// BarChart
    google.charts.load('current', {packages: ['corechart', 'bar']});
    google.charts.setOnLoadCallback(drawChart);
    function drawChart() {
        var dataArray1 = [
            ['Name', 'Cantidad', {role: 'annotation'}, {role: 'style'}],
            ['Privado', isPublicFalse, isPublicFalse, 'color: #00cc99'],
            ['Público', isPublicTrue, isPublicTrue, 'color: #9400CC']
        ];
        data1 = google.visualization.arrayToDataTable(dataArray1);
        // var dataArray2 = [
        //     ['Name', 'Cantidad', {role: 'annotation'}, {role: 'style'}],
        //     ['Realizadas', 13, '13%', 'color: #00cc99'],
        //     ['Futuras', 18, '18%', 'color: #9400CC'],
        //     ['No realizadas', 20, '20%', 'color: #FF5F3E']
        // ];
        // data2 = google.visualization.arrayToDataTable(dataArray2);
        // var dataArray3 = [
        //     ['Name', 'Cantidad', {role: 'annotation'}, {role: 'style'}],
        //     ['Activas', 23, '23%', 'color: #00cc99'],
        //     ['Redirecciones', 45, '45%', 'color: #9400CC'],
        //     ['Rotas', 4, '4%', 'color: #FF5F3E']
        // ];
        // data3 = google.visualization.arrayToDataTable(dataArray3);
        // var dataArray4 = [
        //     ['Presupuesto', 'Cantidad', {role: 'annotation'}, {role: 'style'}],
        //     ['Atendidas', 13, '13%', 'color: #00cc99'],
        //     ['Por atender', 35, '35%', 'color: #9400CC'],
        //     ['No atendidas', 100, '100%', 'color: #FF5F3E']
        // ];
        // data4 = google.visualization.arrayToDataTable(dataArray4);
        // var dataArray5 = [
        //     ['Presupuesto', 'Cantidad', {role: 'annotation'}, {role: 'style'}],
        //     ['Publicados', 35, '35%', 'color: #9400CC'],
        //     ['Por publicar', 100, '100%', 'color: #FF5F3E']
        // ];
        // data5 = google.visualization.arrayToDataTable(dataArray5);
        var options = {
            //width:280, height:180,
            animation: {
                duration: 1000,
                easing: 'out'
            },
            annotations: {
                textStyle: {
                    color: 'gray',
                    fontSize: 10
                },
                highContrast: false,
                alwaysOutside: true
            },
            legend: {position: 'none'},
            hAxis: {
                textPosition: 'none',
                gridlines: {
                    color: 'transparent'
                }
            },
            isStacked: false
        };
        var chart1 = new google.visualization.BarChart(document.getElementById('bar-chart1'));
        chart1.draw(data1, options);
        // var chart2 = new google.visualization.BarChart(document.getElementById('bar-chart2'));
        // chart2.draw(data2, options);
        // var chart3 = new google.visualization.BarChart(document.getElementById('bar-chart3'));
        // chart3.draw(data3, options);
        // var chart4 = new google.visualization.BarChart(document.getElementById('bar-chart4'));
        // chart4.draw(data4, options);
        // var chart5 = new google.visualization.BarChart(document.getElementById('bar-chart5'));
        // chart5.draw(data5, options);
    }
} //Fin getapiOrg()
