import React, { useEffect, useState, ChangeEvent, FormEvent } from "react";
import { Link, useHistory } from "react-router-dom";
import { FiArrowLeft } from "react-icons/fi";
import { Map, TileLayer, Marker } from "react-leaflet";
import { LeafletMouseEvent } from "leaflet";
import axios from "axios";

import Dropzone from "../../components/Dropzone";

import "./CreatePoint.css";
import logo from "../../assets/logo.svg";
import api from "../../services/api";

interface Item {
  id: number;
  title: string;
  image_url: string;
}

interface IBGEStateResponse {
  id: number;
  sigla: string;
}

interface IBGECityResponse {
  id: number;
  nome: string;
}

const CreatePoint = () => {
  const [items, setItems] = useState<Item[]>([]);
  const [states, setStates] = useState<IBGEStateResponse[]>([]);
  const [cities, setCities] = useState<IBGECityResponse[]>([]);
  const [selectedFile, setSelectedFile] = useState<File>();
  const [selectedState, setSelectedState] = useState("0");
  const [selectedCity, setSelectedCity] = useState("0");
  const [clickedPosition, setClickedPosition] = useState<[number, number]>([
    0,
    0,
  ]);
  const [initialPosition, setInitialPosition] = useState<[number, number]>([
    0,
    0,
  ]);
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    whatsapp: "",
  });

  const history = useHistory();

  useEffect(() => {
    api.get("items").then((resp) => {
      setItems(resp.data);
    });
  }, []);

  useEffect(() => {
    axios
      .get<IBGEStateResponse[]>(
        "https://servicodados.ibge.gov.br/api/v1/localidades/estados?orderBy=nome"
      )
      .then((resp) => {
        setStates(resp.data);
      });
  }, []);

  useEffect(() => {
    if (selectedState === "0") {
      return;
    }

    axios
      .get<IBGECityResponse[]>(
        `https://servicodados.ibge.gov.br/api/v1/localidades/estados/${selectedState}/distritos?orderBy=nome`
      )
      .then((resp) => {
        setCities(resp.data);
      });
  }, [selectedState]);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition((position) => {
      const { latitude, longitude } = position.coords;
      setInitialPosition([latitude, longitude]);
    });
  }, []);

  function handleInputChange(e: ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  }

  function handleMapClick(e: LeafletMouseEvent) {
    setClickedPosition([e.latlng.lat, e.latlng.lng]);
  }

  function handleClickedItem(id: number) {
    const hasClicked = selectedItems.includes(id);

    if (!hasClicked) {
      setSelectedItems([...selectedItems, id]);
    } else {
      const filteredItems = selectedItems.filter((item) => item !== id);
      setSelectedItems(filteredItems);
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    const { name, email, whatsapp } = formData;
    const state = selectedState;
    const city = selectedCity;
    const [latitude, longitude] = clickedPosition;
    const items = selectedItems;

    const data = new FormData();


      data.append("name", name);
      data.append("email", email);
      data.append("whatsapp", whatsapp);
      data.append("state", state);
      data.append("city", city);
      data.append("latitude", String(latitude));
      data.append("longitude", String(longitude));
      data.append("items", items.join(","));
      if(selectedFile){
        data.append("image", selectedFile);
      }


    await api.post("points", data);
    history.push("/");
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
        <h1>Cadastro do ponto de coleta</h1>

        <Dropzone onFileUpload={setSelectedFile}/>

        <fieldset>
          <legend>
            <h2>Dados</h2>
          </legend>

          <div className="field">
            <label htmlFor="name">Nome da entidade</label>
            <input
              type="text"
              name="name"
              id="name"
              onChange={handleInputChange}
            />
          </div>

          <div className="field-group">
            <div className="field">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                name="email"
                id="email"
                onChange={handleInputChange}
              />
            </div>
            <div className="field">
              <label htmlFor="whatsapp">Whatsapp</label>
              <input
                type="text"
                name="whatsapp"
                id="whatsapp"
                onChange={handleInputChange}
              />
            </div>
          </div>
        </fieldset>

        <fieldset>
          <legend>
            <div>
              <h2>Endereço</h2>
              <span>Selecione o endereço no mapa</span>
            </div>
          </legend>

          <Map center={initialPosition} zoom={15} onClick={handleMapClick}>
            <TileLayer
              attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            <Marker position={clickedPosition} />
          </Map>
          <div className="field-group">
            <div className="field">
              <label htmlFor="state">Estado (UF)</label>
              <select
                name="uf"
                id="uf"
                onChange={(e: ChangeEvent<HTMLSelectElement>) =>
                  setSelectedState(e.target.value)
                }
              >
                <option value="0">Selecine uma UF</option>
                {states.map((state) => (
                  <option key={state.id} value={state.sigla}>
                    {state.sigla}
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label htmlFor="city">Cidade</label>
              <select
                name="city"
                id="city"
                onChange={(e: ChangeEvent<HTMLSelectElement>) =>
                  setSelectedCity(e.target.value)
                }
              >
                <option value="0">Selecine uma cidade</option>
                {cities.map((city) => (
                  <option key={city.id} value={city.nome}>
                    {city.nome}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </fieldset>

        <fieldset>
          <legend>
            <div>
              <h2>Itens de coleta</h2>
              <span>Selecione um ou mais itens abaixo</span>
            </div>
          </legend>

          <ul className="items-grid">
            {items.map((item) => (
              <li
                className={selectedItems.includes(item.id) ? "selected" : ""}
                key={item.id}
                onClick={() => handleClickedItem(item.id)}
              >
                <img src={item.image_url} alt={item.title} />
                <span>{item.title}</span>
              </li>
            ))}
          </ul>
        </fieldset>

        <button type="submit">Cadastrar ponto de coleta</button>
      </form>
    </div>
  );
};

export default CreatePoint;
