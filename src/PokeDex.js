import { useState, useEffect } from "react";
import ReactLoading from "react-loading";
import axios from "axios";
import Modal from "react-modal";
import { filter, map, debounce, sortBy, reverse } from "lodash";
import { Chart } from "react-google-charts";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

import "./App.css";
import "./PokeDex.scss";

const customStyles = {
  content: {
    top: "50%",
    left: "50%",
    right: "auto",
    bottom: "auto",
    marginRight: "-50%",
    transform: "translate(-50%, -50%)",
    border: "none",
    borderRadius: '8px'
  },
};

function PokeDex() {
  const [pokemons, setPokemons] = useState([]);
  const [pokemonDetail, setPokemonDetail] = useState(null);
  const [filteredPokemons, setFilteredPokemons] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [sortMethod, setSortMethod] = useState("");

  useEffect(() => {
    handleAPICall();
  }, []);

  const handleAPICall = async (url = "") => {
    setIsLoading(true);
    try {
      const response = await axios.get(
        url ? url : "https://pokeapi.co/api/v2/pokemon"
      );
      if (response.data) {
        setPokemons(response.data);
        setFilteredPokemons(response.data);
        setSortMethod("ASC");
      }
      setIsLoading(false);
    } catch (err) {
      console.log(err);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const sort = () =>
      sortBy(filteredPokemons.results, (result) => result.name);
    if (sortMethod === "ASC") {
      setFilteredPokemons((prevValues) => ({ ...prevValues, results: sort() }));
    } else if (sortMethod === "DESC") {
      setFilteredPokemons((prevValues) => ({
        ...prevValues,
        results: reverse(sort()),
      }));
    } else {
      setFilteredPokemons((prevValues) => ({
        ...prevValues,
        results: pokemons.results,
      }));
    }
  }, [sortMethod]);

  const filterResults = (e) => {
    if (e.target.value) {
      console.log( filter(filteredPokemons.results, (pokemon) =>
      pokemon.name.includes(e.target.value))
    );
      setFilteredPokemons( (prevValues) => ({
        ...prevValues,
        results: filter(prevValues.results, (pokemon) =>
        pokemon.name.includes(e.target.value)
      )
      })
       
      );
    } else {
      setFilteredPokemons((prevValues) => ({...prevValues, results:pokemons.results}));
    }
  };

  const handleClick = async (pokemon) => {
    const { name, url } = pokemon;
    try {
      const response = await axios.get(url);
      if (response.data) {
        setPokemonDetail({
          name,
          details: response.data,
        });
      }
    } catch (err) {
      console.log(err);
    }
  };

  const toPdf = (name) => {
    html2canvas(document.querySelector("#pokemonStat"), {
      // backgroundColor: "transparent",
      imageTimeout: 15000,
      useCORS: true,
    }).then((canvas) => {
      const pdf = new jsPDF();
      pdf.addImage(canvas, "pdf", 0, 0);
      pdf.save(`${name}.pdf`);
    });
  };

  // if (!isLoading && pokemons.length === 0) {
  //   return (
  //     <div>
  //       <header className="App-header">
  //         <ReactLoading />
  //         {/* <h1>Welcome to pokedex !</h1>
  //                         <h2>Requirement:</h2>
  //                         <ul>
  //                           <li>
  //                             Call this api:https://pokeapi.co/api/v2/pokemon to get pokedex, and show a list of pokemon name.
  //                           </li>
  //                           <li>Implement React Loading and show it during API call</li>
  //                           <li>when hover on the list item , change the item color to yellow.</li>
  //                           <li>when clicked the list item, show the modal below</li>
  //                           <li>
  //                             Add a search bar on top of the bar for searching, search will run
  //                             on keyup event
  //                           </li>
  //                           <li>Implement sorting and pagingation</li>
  //                           <li>Commit your codes after done</li>
  //                           <li>If you do more than expected (E.g redesign the page / create a chat feature at the bottom right). it would be good.</li>
  //                         </ul> */}
  //       </header>
  //     </div>
  //   );
  // }
  console.log(filteredPokemons)
  return (
    <>
      <div className="pokedex__wrapper">
        {isLoading ? (
          <>
            <header className="pokedex__loading">
              <ReactLoading  color="#00586b"/>
            </header>
          </>
        ) : (
          <>
            <div className="pokedex__header">
              <h1> Welcome to pokedex! </h1>
              {pokemons.results && pokemons.results.length > 0 && (
                <div className="action--wrapper">
                  <input
                    type="text"
                    onChange={debounce((e) => filterResults(e), 300)}
                    className="searchbox"
                    placeholder="search pokemon"
                  />
                  <div className="sorting">
                    <button
                      onClick={() =>
                        setSortMethod(
                          sortMethod === "ASC"
                            ? "DESC"
                            : sortMethod === "DESC"
                            ? ""
                            : "ASC"
                        )
                      }
                    >
                      {sortMethod === "ASC" && "Sort Descending"}
                      {sortMethod === "DESC" && "No Sort"}
                      {sortMethod === "" && "Sort Ascending"}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {pokemons.results && pokemons.results.length > 0 ? (
              <>
                
                <ul className="pokemon__list">
                  {filteredPokemons &&
                    map(filteredPokemons.results, (pokemon) => (
                      <li
                        className="pokemon__item"
                        onClick={() => handleClick(pokemon)}
                        key={pokemon.name}
                      >
                        {pokemon.name}
                      </li>
                    ))}
                </ul>
                <div class="pagination">
                  <button
                    onClick={() =>
                      filteredPokemons.previous &&
                      handleAPICall(filteredPokemons.previous)
                    }
                  >
                    Prev
                  </button>
                  <button
                    onClick={() =>
                      filteredPokemons.next &&
                      handleAPICall(filteredPokemons.next)
                    }
                  >
                    Next
                  </button>
                </div>
              </>
            ) : (
              "No pokemons available"
            )}
          </>
        )}
      </div>

      {pokemonDetail && (
        <Modal
          isOpen={pokemonDetail}
          contentLabel={pokemonDetail?.name || ""}
          onRequestClose={() => {
            setPokemonDetail(null);
          }}
          style={customStyles}
        >
          {pokemonDetail.details && (
            <div className="pokemon__wrapper" id="pokemonStat">
              <div className="pokemon__avatar">
                <img
                  src={pokemonDetail.details.sprites.front_default}
                  alt={`${pokemonDetail.name}-avatar`}
                />
              </div>
              <div className="pokemon__stats">
                <table className="pokemon__statTable">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Stat</th>
                    </tr>
                  </thead>
                  <tbody>
                    {map(
                      pokemonDetail.details.stats,
                      ({ stat: { name: stateName }, base_stat }) => (
                        <tr>
                          <td>{stateName}</td>
                          <td>{base_stat}</td>
                        </tr>
                      )
                    )}
                  </tbody>
                </table>
                <div className="pokemon__statChart">
                  <Chart
                    chartType="BarChart"
                    data={[
                      ["name", "stat"],
                      ...map(
                        pokemonDetail.details.stats,
                        ({ stat: { name: stateName }, base_stat }) => [
                          stateName,
                          base_stat,
                        ]
                      ),
                    ]}
                    height="200px"
                    width="400px"

                    options={{
                      backgroundColor: "transparent",
                      legend: "none",
                      colors: ["#00586b"]
                    }}
                    legendToggle={false}
                  />
                </div>
                <button
                  onClick={() => toPdf(pokemonDetail.name)}
                  className="downloadButton"
                >
                  Download
                </button>
              </div>
            </div>
          )}

          {/* <div>
            Requirement:
            <ul>
              <li> show the sprites front_default as the pokemon image </li>
              <li>
                Show the stats details - only stat.name and base_stat is
                required in tabular format
              </li>
              <li> Create a bar chart based on the stats above </li>
              <li>
                Create a buttton to download the information generated in this
                modal as pdf.(images and chart must be included)
              </li>
            </ul>
          </div> */}
        </Modal>
      )}
    </>
  );
}

export default PokeDex;
