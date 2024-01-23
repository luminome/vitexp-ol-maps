import '/openlayers/map.scss';
import Map from 'ol/Map.js';
import View from 'ol/View.js';
import OSM from 'ol/source/OSM.js';
import Layer from 'ol/layer/Layer.js';
import {composeCssTransform} from 'ol/transform.js';

import {Image as ImageLayer, Tile as TileLayer} from 'ol/layer.js';
import { useGeographic, toLonLat, fromLonLat } from 'ol/proj.js';
import {ScaleLine, defaults as defaultControls} from 'ol/control.js';

import { import_svg } from '/openlayers/svgutil.js'
import * as UT from 'sac-utilities';


let control;

function scaleControl() {
    control = new ScaleLine({
        units: 'metric',
        bar: true,
        steps: 3,
        text: true,
        minWidth: 140,
    });
    return control;
}

const layers = [
    new TileLayer({
        source: new OSM(),
    }),
    // new ImageLayer({
    //     extent: [-13884991, 2870341, -7455066, 6338219],
    //     source: new ImageSource({
    //         loader: createLoader({
    //         url: 'https://ahocevar.com/geoserver/wms',
    //         params: {'LAYERS': 'topp:states', 'FORMAT': 'image/svg+xml'},
    //         ratio: 1,
    //         load: load,
    //         }),
    //     }),
    // }),
];


// const map = new Map({
//   target: 'map',
//   view: new View({
//     center: [0, 0],
//     extent: [-180, -90, 180, 90],
//     projection: 'EPSG:4326',
//     zoom: 2,
//   }),
// });

// org 10.200007651917469,63.24999584816791
// bottom-right 10.550003247862797,62.94684875611122

const org = [10.26, 63.1];
const ext = [9.8, 62.75, 11, 63.5];
const box = [10.2, 62.95, 10.55, 63.27];

const bbox = {
    x:box[0],
    y:box[3],
    w_deg:UT.round_to_dec(box[2]-box[0],3),
    h_deg:UT.round_to_dec((box[1]-box[3])*-1,3),
    w_m:null,
    h_m:null
}

const og = fromLonLat([bbox.x, bbox.y]);
const dg = fromLonLat([bbox.x + bbox.w_deg, bbox.y + (bbox.h_deg)]);
bbox.w_m = Math.round(dg[0]-og[0]);
bbox.h_m = Math.round((og[1]-dg[1])*-1);



const output = document.querySelector('#map-output');
const zoomlevel = document.querySelector('#map-zoom');
const map_dom = document.querySelector('#map');

map_dom.addEventListener('mouseup', function(){
    const el = document.createElement('div');
    el.innerHTML = `${coord}`;
    output.prepend(el);
});


let map_svg;
let coord = [];
let zoom;

/*
top [
    10.387681612153797,
    63.48562234640363
]
bottom [
    10.472587295664662,
    62.9642367309836
]
left [
    10.199962907156271,
    63.10550624718374
]
right [
    10.556382362330124,
    62.97852514060034
]


10.199962907156271, 63.48562234640363, 10.556382362330124, 62.9642367309836


*/
// map.on('mouseup', function(evt){
//     // Get the pointer coordinate
//     let coordinate = ol.proj.transform(evt.coordinate);
//     console.log(coordinate);
// });




// map.getView().setRotation(Math.PI / 2.6 );













const places = {
    kvalsbridge:[10.281673755208665,63.22715537612237],
    bua_bridge:[10.474150458678704,62.97064261223244],
    bus:[10.288532179143838, 63.036462951562896]
}




/*
required: set scale of overlay element from jump. maybe assume 1.0 degrees.
*/






const width = bbox.w;//derv[0];
const height = bbox.h;//derv[1];
const svgResolution = 1;

const svgContainer = document.createElement('div');
svgContainer.style.width = width + 'px';
svgContainer.style.height = height + 'px';
svgContainer.style.transformOrigin = 'top left';
svgContainer.className = 'svg-layer';

svgContainer.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"></svg>'

const svg_inline = svgContainer.querySelector('svg');

const svg_defs = UT.createSVGElement('defs');

svg_inline.appendChild(svg_defs);

svgContainer.appendChild(svg_inline);



const map_to = (coord, target) => {
    const ktg = fromLonLat(coord);
    const d = [ktg[0] - og[0], (ktg[1] - og[1])*-1];

    UT.setAttrs(target,{
        x:d[0]-256,
        y:d[1]-256,
        width:512,
        height:512,
        opacity:0.5
    })
}



const key_obj_types = {
    zone:{
        icon: 'zone-symbol',
        icon_scale: 5,
        label: true,
        zoom:{
            flag:'always',
            min:13,
            max:10
        },
        opacity:0.5
    },
    beat_mark:{
        icon: 'beat-mark-symbol',
        icon_scale: 0.25,
        zoom:{
            flag:'bracket',
            min:12
        },
        opacity:1.0
    }
}

const map_key_obj = (type, name, coord, significance=1) => {

    const setZoom = (z) => {

        const zt = UT.norm(o.zoom.min, z, o.zoom.max);
        if(o.zoom.flag === 'always'){
            UT.setAttrs(o.svg, {opacity:zt});
        }

        if(o.zoom.flag === 'bracket'){
            UT.setAttrs(o.symbol, {visibility:['visible','hidden'][+(o.zoom.min > z)]});
        }
        

        if(o.label !== null){
            const bbox = o.label.getBBox();
            if(bbox.width === 0) return;
            const px_scale = 256 * (o.icon_scale*significance);
            const sca = ((px_scale*1.5)/bbox.width);
            UT.setAttrs(o.label,{
                transform: `scale(${sca},${sca})`
            })
        }



    }

    const draw = () => {
        const ktg = fromLonLat(o.coord);
        const d = [ktg[0] - og[0], (ktg[1] - og[1])*-1];
        const px_scale = 256 * (o.icon_scale*significance);

        UT.setAttrs(o.symbol,{
            x:-px_scale,
            y:-px_scale,
            width:px_scale*2,
            height:px_scale*2,
            opacity:o.opacity
        })

        UT.setAttrs(o.svg,{
            transform: `translate(${d[0]},${d[1]})`
        })
    }

    const init = () => {
        Object.assign(o,key_obj_types[type]);
        
        o.svg = UT.createSVGElement('g',{id:name});
        o.symbol = UT.createSVGElement('use',{href:`#${o.icon}`, id:name});
        o.svg.appendChild(o.symbol);


        if(o.label){
            o.label = UT.createSVGElement('text',{
                'fill':'slategray',
                'text-anchor':'middle',
                'dominant-baseline':'middle',
                'font-kerning': 'auto',
                'font-family':`'Helvetica', 'Arial', sans-serif;`
            });
            o.label.innerHTML = name.toUpperCase();
            o.svg.appendChild(o.label);
        }
    }

    const o = {
        svg: null,
        symbol: null,
        label: null,
        coord: coord,
        setZoom
    }

    init();
    draw();

    return o;
}






const map_key_elements = [];


const svg_loaded = () => {
    // map_svg = document.querySelector('svg');
    console.log('did a load');





    Object.entries(places).forEach(([k,v])=>{
        console.log(k,v)
        // const p = UT.createSVGElement('circle',{r:10, fill:'black', stroke:'black', id:k});
        const p = UT.createSVGElement('use',{href:'#zone-symbol', id:k});
        svg_inline.appendChild(p);
        map_to(v,p);
    })

    const zones = [
        map_key_obj('zone','kvål',[10.281673755208665,63.22715537612237],5),
        map_key_obj('zone','lundamo',[10.264492888245316,63.14847932963741],3),
        map_key_obj('zone','støren',[10.336120326035664,63.01950030824776],7),
        map_key_obj('zone','bua',[10.489479106438273,62.98251417251333],3),
        map_key_obj('beat_mark','lundamo-2',[10.268060595590706,63.14988589451647]),
        map_key_obj('beat_mark','lundamo-1',[10.264246254065357,63.14725628154966]),
    ]

    zones.forEach((zone) => {
        svg_inline.appendChild(zone.svg);
        map_key_elements.push(zone);
    })
    // const kval = map_key_obj('zone','kvål',[10.281673755208665,63.22715537612237],5);
    // const lundamo = map_key_obj('zone','lundamo',[10.264492888245316,63.14847932963741],3);
    // const home = map_key_obj('zone','home',[10.336120326035664,63.01950030824776],7);
    // svg_inline.appendChild(kval.svg);
    // svg_inline.appendChild(lundamo.svg);
    // svg_inline.appendChild(home.svg);

    // map_key_elements.push(kval);
    // map_key_elements.push(lundamo);
    // map_key_elements.push(home);
    
    // console.log(kval);



    // const tgt = map_svg.querySelector('#bus');
    // map_to(bua_bridge,tgt);

}



const init_map = () => {

    const map = new Map({
        controls: defaultControls().extend([scaleControl()]),
        layers: layers,
        target: 'map',
        view: new View({
            center: org,
            extent: ext,
            projection: useGeographic(),
            zoom: 2,
        }),
    });
    
    map.addLayer(
        new Layer({
            render: function (frameState) {
                // console.log(frameState);
                const ko = [bbox.x, bbox.y];
                const kpf = fromLonLat(ko);
                const scale = svgResolution / frameState.viewState.resolution;
                const center = frameState.viewState.center;
                const size = frameState.size;
                const cssTransform = composeCssTransform(
                    size[0] / 2,
                    size[1] / 2,
                    scale,
                    scale,
                    frameState.viewState.rotation,
                    (kpf[0] - center[0]) / svgResolution,
                    (kpf[1] - center[1]) / -svgResolution
                );
                svgContainer.style.transform = cssTransform;
                zoom = frameState.viewState.zoom;
                zoomlevel.innerHTML = zoom;

                map_key_elements.forEach((mke) => mke.setZoom(zoom));
                return svgContainer;
            },
        })
    );

    map.on('pointermove', function(evt){
        coord = evt.coordinate;
    })
    
    const ref_u = map.getView().getProjection().getUnits();
    console.warn('map loaded', ref_u);


    UT.setAttrs(svg_inline,{
        width:bbox.w_m,
        height:bbox.h_m
    })
    
    const logo = UT.createSVGElement('use',{href:'#nfc-logo-symbol', id:'logo'});
    

    UT.setAttrs(logo,{
        x:bbox.w_m - bbox.w_m/6,
        y:-2280,
        width:bbox.w_m/6,
        height:bbox.h_m/6
    })

    svg_inline.appendChild(logo);
    svg_loaded();

}


const start_simple = async () => {
    const res = await import_svg([
        '/icons/zone.svg',
        '/icons/hut.svg',
        '/icons/beat-mark.svg',
        '/icons/parking.svg',
        '/icons/nfc-logo.svg']);
    console.log(res);
    res.forEach((r) => svg_defs.appendChild(r));
    init_map();
    
}


start_simple();




















// const svgContainer = document.createElement('div');
// const xhr = new XMLHttpRequest();
// xhr.open('GET', '/small-world.svg');
// xhr.addEventListener('load', function () {
//     const svg = xhr.responseXML.documentElement;
//     svgContainer.ownerDocument.importNode(svg);
//     svgContainer.appendChild(svg);
//     svg_loaded();
// });
// xhr.send();


