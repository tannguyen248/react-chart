import React, { Component } from 'react';
import { Bar } from 'react-chartjs-2';
import * as _ from 'lodash';

class App extends Component {
  username = 'admin';
  password = 'ToPsEcReT';

  constructor(props) {
    super(props);
    this.state = {
      data: [],
      selectedOption: '',
    };
  }

  getData(queryString) {
    const base = 'https://homeexercise.volumental.com/sizingsample';
    let requestURL = `${base}${queryString ? queryString : ''}`;

    fetch(requestURL, {
      methid: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        'Authorization': `Basic ${btoa(this.username + ":" + this.password)}`
      }
    }).then(res => {
      return res.json();
    }).then(json => {
      this.setState({
        data: _.concat(this.state.data, json.data)
      });

      if (json['next-page']) {
        this.getData(`?page=${json['next-page']}`);
      }
    }).catch(error => {
      console.log(error);
    });
  };

  handleOptionChange = (changeEvent) => {
    this.setState({
      selectedOption: changeEvent.target.value
    });
  };

  getChartData() {
    let selectedData = this.state.data.find(x => `${x.system}-${x.gender}` === this.state.selectedOption);
    let chartDataSets = [];
    let data = {
      datasets: [],
      labels: []
    }

    if (selectedData) {
      let sizes = selectedData.sizes;
      let labels = [];
      let dataSets = [];
      let sizeSymbols = new Set();;

      labels = Object.keys(sizes);
      labels.forEach(label => {
        let symbols = Object.keys(sizes[label]);
        symbols.forEach(symbol => {
          sizeSymbols.add(symbol);
          dataSets[symbol] = [];
        })
      });

      sizeSymbols = Array.from(sizeSymbols);
      sizeSymbols.sort();

      for (let label in sizes) {
        for (let symbol of sizeSymbols) {
          let value = sizes[label][symbol] ? parseInt(sizes[label][symbol]) : 0;
          dataSets[symbol].push(value);
        }
      }

      for (let i = 0; i < sizeSymbols.length; i++) {
        let key = sizeSymbols[i];
        let color = `rgba(${_.random(1, 255)}, ${_.random(1, 255)}, ${_.random(1, 255)}, ${_.random(1, 255)})`;
        chartDataSets.push({
          label: key,
          backgroundColor: color,
          borderColor: color,
          borderWidth: i + 1,
          stack: i + 1,
          hoverBackgroundColor: color,
          hoverBorderColor: color,
          data: dataSets[key]
        });
      }

      data.datasets = chartDataSets;
      data.labels = labels;
    }

    return data;
  }

  componentDidMount() {
    this.getData();
  }

  render() {
    const options = {
      maintainAspectRatio: true,
      scales: {
           xAxes: [{
               stacked: true
           }],
           yAxes: [{
               stacked: false
           }]
       }
    };

    let data = this.getChartData();

    return (
      <div className="App">
        {this.state.data.map((x,i) =>
          <label key={`${x.system}-${x.gender}`}>
            <input
              type="radio"
              value={`${x.system}-${x.gender}`}
              checked={this.state.selectedOption === `${x.system}-${x.gender}`}
              onChange={this.handleOptionChange}
            />
            {`${x.system}-${x.gender}`}
          </label>
        )}

        { data.labels &&
          data.labels.length > 0 &&
          data.datasets &&
          data.datasets.length > 0 &&
          <Bar
            data={data}
            options={options}
            width={500}
          />
        }
      </div>
    );
  }
}

export default App;
