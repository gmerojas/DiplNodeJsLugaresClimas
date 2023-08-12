const fs = require('fs');
const axios = require('axios');

class Busquedas{
    dbPath = './db/database.json';
    historial = [];
    constructor(){
        this.leerDB();
    }

    get historialCapitalizado(){
        return this.historial.map(lugar => {
            let palabras = lugar.split(' ');
            palabras = palabras.map(p => p[0].toUpperCase()+p.substring(1));
            return palabras.join(' ');
        });
    }

    get paramMapBox(){
        return {
            'access_token': process.env.MAPBOX_KEY,
            'limit': 5,
            'languaje': 'es'
        }
    }

    get paramWeather(){
        return{
            appid:process.env.OPENWEATHER_KEY,
            units: 'metric',
            lang: 'es'
        }
    }

    async ciudad(lugar=''){
        try{
            //peticion http

            const instance = axios.create({
                baseURL: `https://api.mapbox.com/geocoding/v5/mapbox.places/${lugar}.json`,
                params: this.paramMapBox
            });

            const resp = await instance.get('');
            return resp.data.features.map(lugar => ({
                id: lugar.id,
                nombre: lugar.place_name,
                lng: lugar.center[0],
                lat: lugar.center[1]
            }));
        }catch(error){
            return[];
        }
    }

    async climaLugar(lat,lon){
        try{
            const instance = axios.create({
                //url
                baseURL: `https://api.openweathermap.org/data/2.5/weather`,
                //desestructuracion
                params: {...this.paramWeather, lat, lon}
            });
            const resp = await instance.get();
            //console.log('RESP:',resp.data);
            const {weather,main} = resp.data;
            return{
                desc: weather[0].description,
                min: main.temp_min,
                max: main.temp_max,
                temp: main.temp
            }
        }catch(error){
            console.log(error);
        }
    }

    agregarHistorial(lugar=''){
        //prevenir duplicados
        if(this.historial.includes(lugar.toLocaleLowerCase())) return;
        this.historial.unshift(lugar.toLocaleLowerCase());
        this.historial = this.historial.splice(0,5);
        //guardar DB
        this.guardarDB();
    }

    guardarDB(){
        const payload = {
            historial: this.historial
        };
        fs.writeFileSync(this.dbPath, JSON.stringify(payload));
    }

    leerDB(){
        if(!fs.existsSync(this.dbPath)) return;
        const info = fs.readFileSync(this.dbPath,{encoding:'utf-8'});
        const data = JSON.parse(info);
        this.historial = data.historial;
    }
}

module.exports = Busquedas;