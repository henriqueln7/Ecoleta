import React, {ChangeEvent, FormEvent, useEffect, useState} from 'react';
import {Link, useHistory} from "react-router-dom";
import {FiArrowLeft} from 'react-icons/fi';
import { Map, TileLayer, Marker } from 'react-leaflet';
import axios from 'axios';
import './styles.css';
import logo from '../../assets/logo.svg';
import api from "../../services/api";
import {LeafletMouseEvent} from "leaflet";

type Item = {
    id: number;
    title: string;
    image: string;
}

type IBGEUFResponse = {
    sigla: string;
}

type IBGECityResponse = {
    nome: string;
}

const CreatePoint = () => {

    const [items, setItems] = useState<Item[]>([]);
    const [ufs, setUfs] = useState<string[]>([]);
    const [cities, setCities] = useState<string[]>([]);

    const [inputData, setInputData] = useState({
        name: '',
        whatsapp: '',
        email: '',
    });

    const [selectedItems, setSelectedItems] = useState<number[]>([]);

    const [selectedUF, setSelectedUF] = useState("0");
    const [selectedCity, setSelectedCity] = useState("0");
    const [initialPosition, setInitialPosition] = useState<[number, number]>([0, 0]);

    const [selectedPosition, setSelectedPosition] = useState<[number, number]>([0, 0]);

    const history = useHistory();

    useEffect(() => {
        navigator.geolocation.getCurrentPosition(position => {
            setInitialPosition([position.coords.latitude, position.coords.longitude]);
        })
    }, []);

    useEffect(() => {
        api.get("items").then((response) => {
            setItems(response.data);
        });
    }, []);

    useEffect(() => {
        axios.get<IBGEUFResponse[]>("https://servicodados.ibge.gov.br/api/v1/localidades/estados?orderBy=nome").then((response) => {
            const ufInitials = response.data.map(uf => uf.sigla);
            setUfs(ufInitials);
        })
    }, []);

    useEffect(() => {
        if(selectedUF !== "0") {
            axios.get<IBGECityResponse[]>(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${selectedUF}/municipios`).then((response) => {
                const cityNames = response.data.map(city => city.nome);
                setCities(cityNames);
            })
        }
    }, [selectedUF]);

    function handleSelectUf(event: ChangeEvent<HTMLSelectElement>) {
        const uf = event.target.value;
        setSelectedUF(uf);
    }
    function handleSelectCity(event: ChangeEvent<HTMLSelectElement>) {
        const city = event.target.value;
        setSelectedCity(city);
    }

    function handleMapClick(event: LeafletMouseEvent) {
        setSelectedPosition([event.latlng.lat, event.latlng.lng])
    }

    function handleInputChange(event: ChangeEvent<HTMLInputElement>) {
        setInputData({...inputData, [event.target.name]: event.target.value });
    }

    function handleSelectItem(id: number) {

        if(selectedItems.includes(id)) {
            const filteredItems = selectedItems.filter((item) => item !== id);
            setSelectedItems(filteredItems);
        } else {
            setSelectedItems([...selectedItems, id]);
        }
    }

    async function handleSubmit(event: FormEvent) {
        event.preventDefault();

        const { email, name, whatsapp} = inputData;
        const uf = selectedUF;
        const city = selectedCity;
        const [latitude, longitude] = selectedPosition;
        const items = selectedItems;

        const data = {
            email,
            name,
            whatsapp,
            uf,
            city,
            latitude,
            longitude,
            items,
        };

        await api.post('/points', data);

        alert('Ponto de alerta criado :)');

        history.push('/');
    }

    return (
        <div id="page-create-point">
            <header>
                <img src={logo} alt="Ecoleta" />
                <Link to="/">
                    <FiArrowLeft />
                    Voltar para home
                </Link>
            </header>

            <form onSubmit={handleSubmit}>
                <h1>Cadastro do <br/> ponto de coleta</h1>

                <fieldset>
                    <legend>
                        <h2>Dados</h2>
                    </legend>

                    <div className="field">
                        <label htmlFor="name">Nome da entidade</label>
                        <input type="text" name="name" id="name" onChange={handleInputChange} />
                    </div>
                    <div className="field-group">
                        <div className="field">
                            <label htmlFor="email">E-mail</label>
                            <input type="email" name="email" id="email" onChange={handleInputChange} />
                        </div>
                        <div className="field">
                            <label htmlFor="whatsapp">Whatsapp</label>
                            <input type="text" name="whatsapp" id="whatsapp" onChange={handleInputChange} />
                        </div>
                    </div>
                </fieldset>

                <fieldset>
                    <legend>
                        <h2>Endereço</h2>
                        <span>Selecione o endereço no mapa</span>
                    </legend>

                    <Map center={initialPosition} zoom={15} onClick={handleMapClick} >
                        <TileLayer
                            attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                        <Marker position={selectedPosition}/>
                    </Map>

                    <div className="field-group">
                        <div className="field">
                            <label htmlFor="uf">Estado (UF) </label>
                            <select name="uf" value={selectedUF} id="uf" onChange={handleSelectUf}>
                                <option value="0"> Selecione uma opção</option>
                                {ufs.map(uf => (
                                    <option value={uf} key={uf}>{uf}</option>
                                ))}
                            </select>
                        </div>
                        <div className="field">
                            <label htmlFor="city">Cidade </label>
                            <select name="city" id="city" value={selectedCity} onChange={handleSelectCity}>
                                <option value="0"> Selecione uma cidade</option>
                                {cities.map(city => (
                                    <option value={city} key={city}>{city}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </fieldset>

                <fieldset>
                    <legend>
                        <h2>Items de coleta</h2>
                        <span>Selecione um ou mais itens abaixo</span>
                    </legend>

                    <ul className="items-grid">
                        {
                            items.map(item => (
                                <li key={item.id} onClick={() => handleSelectItem(item.id)} className={selectedItems.includes(item.id) ? 'selected' : ''}>
                                    <img src={item.image} alt="Teste" />
                                    <span>{item.title}</span>
                                </li>
                            ))
                        }

                    </ul>
                </fieldset>

                <button type="submit">
                    Cadastrar ponto de coleta
                </button>
            </form>
        </div>
    )
}

export default CreatePoint;
