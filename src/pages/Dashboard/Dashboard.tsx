// import axios from 'axios';
// import React from 'react';
// import { getAccessToken } from '../LocalStorage/LocalStorage';
// import { Chart as ChartJS, BarElement, CategoryScale, LinearScale, Tooltip, Legend, ArcElement } from 'chart.js';
// import { Bar, Pie } from 'react-chartjs-2';

// ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend, ArcElement);

// type IndicacaoConsultorCount = {
//   indicacao_nome: string;
//   count: string;
// };

// const ChartDashBoard = () => {

//   const [data, setData] = React.useState<{ consultor_comercial: string, count: number }[]>([]);
//   const [indicacaoData, setIndicacaoData] = React.useState<{ usuario: string, count: number }[]>([]);
//   const [parceriaData, setParceriaData] = React.useState<{ usuario: string, count: number }[]>([]);
//   const [indicacaoConsultorData, setIndicacaoConsultorData] = React.useState<{ consultor_comercial: string, count: number }[]>([]);
//   const [indicacaoCountsData, setIndicacaoCountsData] = React.useState<{ label: string, count: number }[]>([]);
//   const [indicacaoConsultorCountsData, setIndicacaoConsultorCountsData] = React.useState<{ label: string, count: number }[]>([]);
//   const [sinalAmareloData, setSinalAmareloData] = React.useState<{ label: string, count: number }[]>([]);
//   const [fileCountData, setFileCountData] = React.useState<{ label: string, count: number }[]>([]);
//   const [ChurnTotalData, setChurnTotalData] = React.useState<{ label: string, count: number }[]>([]);
//   const [churnLast30DaysData, setChurnLast30DaysData] = React.useState<{ label: string, count: number }[]>([]);

//   React.useEffect(() => {
//     axios.get(`${process.env.REACT_APP_API_URL}/tab-prospeccao/count-empresas-consultor`, {
//       headers: {
//         Authorization: `Bearer ${getAccessToken()}`
//       }
//     }).then(response => {
//       if (Array.isArray(response.data)) {
//         setData(response.data);
//       } else {
//         console.error('Data is not an array:', response.data);
//       }
//     }).catch(error => {
//       console.error(error);
//     });

//     axios.get(`${process.env.REACT_APP_API_URL}/tab-indicacao-cliente/count-indicacao-usuario`, {
//       headers: {
//         Authorization: `Bearer ${getAccessToken()}`
//       }
//     }).then(response => {
//       if (Array.isArray(response.data)) {
//         setIndicacaoData(response.data);
//       } else {
//         console.error('Data is not an array:', response.data);
//       }
//     }).catch(error => {
//       console.error(error);
//     });

//     axios.get(`${process.env.REACT_APP_API_URL}/tab-parceria-fast/count-parceria-usuario`, {
//       headers: {
//         Authorization: `Bearer ${getAccessToken()}`
//       }
//     }).then(response => {
//       if (Array.isArray(response.data)) {
//         setParceriaData(response.data);
//       } else {
//         console.error('Data is not an array:', response.data);
//       }
//     }).catch(error => {
//       console.error(error);
//     });

    
//     axios.get(`${process.env.REACT_APP_API_URL}/tab-prospeccao/consultor-indicacao-true`, {
//       headers: {
//         Authorization: `Bearer ${getAccessToken()}`
//       }
//     }).then(response => {
//       if (Array.isArray(response.data)) {
//         setIndicacaoConsultorData(response.data);
//       } else {
//         console.error('Data is not an array:', response.data);
//       }
//     }).catch(error => {
//       console.error(error);
//     });

//     axios.get(`${process.env.REACT_APP_API_URL}/tab-prospeccao/indicacao-counts`, {
//       headers: {
//         Authorization: `Bearer ${getAccessToken()}`
//       }
//     }).then(response => {
//       const data = response.data;
//       if (data && typeof data === 'object') {
//         setIndicacaoCountsData([
//           {
//             label: 'Consultores com Indicação', count: data.indicacaoTrueCount
//           },
//           {
//             label: 'Consultores sem Indicação', count: data.indicacaoFalseCount
//           }
//         ]);
//       } else {
//         console.error('Data is not an object:', data);
//       }
//     }).catch(error => {
//       console.error(error);
//     });

//     axios.get(`${process.env.REACT_APP_API_URL}/tab-prospeccao/indicacao-consultor`, {
//       headers: {
//         Authorization: `Bearer ${getAccessToken()}`
//       }
//     }).then(response => {
//       const data: IndicacaoConsultorCount[] = response.data;
//       if (Array.isArray(data)) {
//         setIndicacaoConsultorCountsData(data
//           .filter(item => item.indicacao_nome) // Exclude items with 'Não Informado'
//           .map((item: IndicacaoConsultorCount) => ({
//             label: item.indicacao_nome,
//             count: parseInt(item.count, 10)
//           }))
//         );
//       } else {
//         console.error('Data is not an array:', data);
//       }
//     }).catch(error => {
//       console.error(error);
//     });

//     axios.get(`${process.env.REACT_APP_API_URL}/tab-sinal-amarelo/sinal-amarelo-pendente`, {
//       headers: {
//         Authorization: `Bearer ${getAccessToken()}`
//       }
//     }).then(response => {
//       const data = response.data;
//       if (Array.isArray(data)) {
//         setSinalAmareloData(data.map((item: { user: string, count: string }) => ({
//           label: item.user,
//           count: parseInt(item.count, 10)
//         })));
//       } else {
//         console.error('Data is not an array:', data);
//       }
//     }).catch(error => {
//       console.error(error);
//     });

//     axios.get(`${process.env.REACT_APP_API_URL}/tab-upload/count-files`, {
//       headers: {
//         Authorization: `Bearer ${getAccessToken()}`
//       }
//     }).then(response => {
//       const data = response.data;
//       if (Array.isArray(data)) {
//         setFileCountData(data.map((item: { usuario: string, count: string }) => ({
//           label: item.usuario,
//           count: parseInt(item.count, 10)
//         })));
//       } else {
//         console.error('Data is not an array:', data);
//       }
//     }).catch(error => {
//       console.error(error);
//     });

//     axios.get(`${process.env.REACT_APP_API_URL}/loja/churn`, {
//       headers: {
//         Authorization: `Bearer ${getAccessToken()}`
//       }
//     }).then(response => {
//       const data = response.data;
//       if (Array.isArray(data)) {
//         setChurnTotalData(data.map((item: { usuario: string, count: string }) => ({
//           label: item.usuario,
//           count: parseInt(item.count, 10)
//         })));
//       } else if (data && typeof data === 'object') {
//         setChurnTotalData(Object.keys(data).map(key => ({
//           label: key,
//           count: data[key]
//         })));
//       } else {
//         console.error('Data is not an array or object:', data);
//       }
//     }).catch(error => {
//       console.error(error);
//     });

//     axios.get(`${process.env.REACT_APP_API_URL}/loja/churn30d`, {
//       headers: {
//         Authorization: `Bearer ${getAccessToken()}`
//       }
//     }).then(response => {
//       const data = response.data;
//       if (data && typeof data === 'object') {
//         setChurnLast30DaysData([
//           { label: 'Data Contratação Fast', count: data.data_contratacao_fast },
//           { label: 'Data Saída Fast', count: data.data_saida_fast }
//         ]);
//       } else {
//         console.error('Data is not an object:', data);
//       }
//     }).catch(error => {
//       console.error(error);
//     });

//   }, []);

//   const chartData = {
//     labels: data.map(item => item.consultor_comercial),
//     datasets: [{
//       label: 'Empresas Prospectadas',
//       data: data.map(item => item.count),
//       backgroundColor: 'rgba(54, 162, 235, 0.7)',
//       borderColor: 'rgba(54, 162, 235, 1)',

//       borderWidth: 1
//     }]
//   };

//   const indicacaoChartData = {
//     labels: indicacaoData.map(item => item.usuario),
//     datasets: [{
//       label: 'Indicações de Clientes',
//       data: indicacaoData.map(item => item.count),
//       backgroundColor: 'rgba(75, 192, 192, 0.8)',
//       borderColor: 'rgba(75, 192, 192, 1)',
//       borderWidth: 1
//     }]
//   };

//   const parceriaChartData = {
//     labels: parceriaData.map(item => item.usuario),
//     datasets: [{
//       label: 'Indicação de Grupos Parceiros',
//       data: parceriaData.map(item => item.count),
//       backgroundColor: 'rgba(153, 102, 255, 0.8)',
//       borderColor: 'rgba(153, 102, 255, 1)',
//       borderWidth: 1
//     }]
//   };


//   const indicacaoConsultorChartData = {
//     labels: indicacaoConsultorData.map(item => item.consultor_comercial),
//     datasets: [{
//       label: 'Clientes Indicados Prospectados por Consultor',
//       data: indicacaoConsultorData.map(item => item.count),
//       backgroundColor: 'rgba(255, 206, 86, 0.8)',
//       borderColor: 'rgba(255, 206, 86, 1)',
//       borderWidth: 1
//     }]
//   };

 
//   const indicacaoCountsChartData = {
//     labels: indicacaoCountsData.map(item => item.label),
//     datasets: [{
//       label: 'Clientes Indicados',
//       data: indicacaoCountsData.map(item => item.count),
//       backgroundColor: [
//         'rgba(75, 192, 192, 0.8)',
//         'rgba(153, 102, 255, 0.8)',
//         // ...additional colors if needed...
//       ],
//       borderColor: [
//         'rgba(75, 192, 192, 1)',
//         'rgba(153, 102, 255, 1)',
//         // ...additional colors if needed...
//       ],
//       borderWidth: 1
//     }]
//   };

//   const indicacaoConsultorCountsChartData = {
//     labels: indicacaoConsultorCountsData.map(item => item.label),
//     datasets: [{
//       label: 'Número de Indicações por Consultor',
//       data: indicacaoConsultorCountsData.map(item => item.count),
//       backgroundColor: [
//         'rgba(54, 162, 235, 0.8)',
//         // ...additional colors if needed...
//       ],
//       borderColor: [
//         'rgba(54, 162, 235, 1)',
//         // ...additional colors if needed...
//       ],
//       borderWidth: 1
//     }]

//   };

//   const sinalAmareloChartData = {
//     labels: sinalAmareloData.map(item => item.label),
//     datasets: [{
//       label: 'Sinal Amarelo Pendente',
//       data: sinalAmareloData.map(item => item.count),
//       backgroundColor: [
//         'rgba(255, 99, 132, 0.8)',
//         'rgba(54, 162, 235, 0.8)',
//         'rgba(255, 206, 86, 0.8)',
//         'rgba(75, 192, 192, 0.8)',
//         // ...additional colors if needed...
//       ],
//       borderColor: [
//         'rgba(255, 99, 132, 1)',
//         'rgba(54, 162, 235, 1)',
//         'rgba(255, 206, 86, 1)',
//         'rgba(75, 192, 192, 1)',
//         // ...additional colors if needed...
//       ],
//       borderWidth: 1
//     }]
//   };

//   const fileCountChartData = {
//     labels: fileCountData.map(item => item.label),
//     datasets: [{
//       label: 'File Counts',
//       data: fileCountData.map(item => item.count),
//       backgroundColor: [
//         'rgba(255, 99, 132, 0.8)',
//         'rgba(54, 162, 235, 0.8)',
//         'rgba(255, 206, 86, 0.8)',
//         'rgba(75, 192, 192, 0.8)',
//         // ...additional colors if needed...
//       ],
//       borderColor: [
//         'rgba(255, 99, 132, 1)',
//         'rgba(54, 162, 235, 1)',
//         'rgba(255, 206, 86, 1)',
//         'rgba(75, 192, 192, 1)',
//         // ...additional colors if needed...
//       ],
//       borderWidth: 1
//     }]
//   };

//   const churnTotalChartData = {
  
//     labels: ChurnTotalData.map(item => item.label),
//     datasets: [{
//       label: 'Churn Total',
//       data: ChurnTotalData.map(item => item.count),
//       backgroundColor: [
//         'rgba(255, 99, 132, 0.8)',
//         'rgba(54, 162, 235, 0.8)',
//         'rgba(255, 206, 86, 0.8)',
//         'rgba(75, 192, 192, 0.8)',
//         // ...additional colors if needed...
//       ],
//       borderColor: [
//         'rgba(255, 99, 132, 1)',
//         'rgba(54, 162, 235, 1)',
//         'rgba(255, 206, 86, 1)',
//         'rgba(75, 192, 192, 1)',
//         // ...additional colors if needed...
//       ],
//       borderWidth: 1
//     }]
//   }

//   const churnLast30DaysChartData = {
//     labels: churnLast30DaysData.map(item => item.label),
//     datasets: [{
//       label: 'Churn últimos 30 dias',
//       data: churnLast30DaysData.map(item => item.count),
//       backgroundColor: [
//         'rgba(255, 99, 132, 0.8)',
//         'rgba(54, 162, 235, 0.8)',
//         // ...additional colors if needed...
//       ],
//       borderColor: [
//         'rgba(255, 99, 132, 1)',
//         'rgba(54, 162, 235, 1)',
//         // ...additional colors if needed...
//       ],
//       borderWidth: 1
//     }]
//   };

//   const options = {
//     scales: {
//       y: {
//         beginAtZero: true,
//         ticks: {
//           color: 'white' // Change this to your desired font color
//         }
//       },
//       x: {
//         ticks: {
//           color: 'white' // Change this to your desired font color
//         }
//       }
//     },
//     plugins: {
//       title: {
//         display: true,
//         text: '',
//         color: 'white' // Change this to your desired font color
//       },
//       legend: {
//         labels: {
//           color: 'white' // Change this to your desired font color HERE
//         }
//       }
//     }
//   };


//   return (
//     <div>
//       <div style={{ display: 'flex', justifyContent: 'space-between', width: '25%', marginLeft: '10%' }}>
//         {data.length > 0 ? <Bar data={chartData} options={options} /> : 'Loading...'}
//         {indicacaoData.length > 0 ? <Bar data={indicacaoChartData} options={options} /> : 'Loading...'}
//         {parceriaData.length > 0 ? <Bar data={parceriaChartData} options={options} /> : 'Loading...'}
//       </div>
//       <div style={{ display: 'flex', justifyContent: 'space-between', width: '25%', marginLeft: '10%' }}>
//         {indicacaoConsultorData.length > 0 ? <Bar data={indicacaoConsultorChartData} options={options} /> : 'Loading...'}
//         {indicacaoConsultorCountsData.length > 0 ? <Bar data={indicacaoConsultorCountsChartData} options={options} /> : 'Loading...'}
        
//       </div>
//       <div style={{ display: 'flex', justifyContent: 'space-between', width: '15%', marginLeft: '10%'}}>
//         {indicacaoCountsData.length > 0 ? <Pie data={indicacaoCountsChartData} options={{ plugins: { title: { display: true, text: 'Indicações', color: 'white' } } }} /> : 'Loading...'}
//         {sinalAmareloData.length > 0 ? <Pie data={sinalAmareloChartData} options={{ plugins: { title: { display: true, text: 'Sinal Amarelo', color: 'white' } } }} /> : 'Loading...'}
//         {fileCountData.length > 0 ? <Pie data={fileCountChartData} options={{ plugins: { title: { display: true, text: 'Arquivos Desenvolvidos', color: 'white' } } }} /> : 'Loading...'}
//         {ChurnTotalData.length > 0 ? <Pie data={churnTotalChartData} options={{ plugins: { title: { display: true, text: 'Churn Total', color: 'white' } } }} /> : 'Loading...'}
//         {churnLast30DaysData.length > 0 ? <Pie data={churnLast30DaysChartData} options={{ plugins: { title: { display: true, text: 'Churn últimos 30 dias', color: 'white' } } }} /> : 'Loading...'}
//       </div>
//       <div style={{ display: 'flex', justifyContent: 'space-between', width: '25%' }}>
//       </div>
//     </div>
//   )
// }

// export default ChartDashBoard

import React from 'react'

const Dashboard = () => {
  return (
    <div style={{
      minHeight: 'calc(100vh - 64px)',
      width: '100%',
      backgroundImage: `url('/Background.jpeg')`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      margin: 0,
      padding: 0,
      boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
    }}>
    </div>
  )
}

export default Dashboard