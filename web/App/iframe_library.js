/*  Collector (Garcia, Kornell, Kerr, Blake & Haffey)
    A program for running experiments on the web
    Copyright 2012-2016 Mikey Garcia & Nate Kornell


    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License version 3 as published by
    the Free Software Foundation.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>

		Kitten/Cat release (2019-2021) author: Dr. Anthony Haffey (team@someopen.solutions)
*/

var libraries = '<meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate" />' +
                '<scr' + 'ipt src="https://code.jquery.com/jquery-3.2.1.min.js"></scr' + 'ipt>' +
								'<scr' + 'ipt src="https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.12.9/umd/popper.min.js" integrity="sha384-ApNbgh9B+Y1QKtv3Rn7W3mgPxhU9K/ScQsAP7hUibX39j7fakFPskvXusvfa0b4Q" crossorigin="anonymous"></scr' + 'ipt>'+

								'<link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0/css/bootstrap.min.css" integrity="sha384-Gn5384xqQ1aoWXA+058RXPxPg6fy4IWvTNh0E263XmFcJlSAwiGgFAW/dAiS6JXm" crossorigin="anonymous">' +
								'<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/jqueryui/1.12.1/jquery-ui.min.css"></link>'+
								'<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/jqueryui/1.12.1/jquery-ui.theme.min.css"></link>'+
								'<scr' + 'ipt src="https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0/js/bootstrap.min.js" integrity="sha384-JZR6Spejh4U02d8jOt6vLEHfe/JQGiRRSQQxSfFWpi1MquVdAyjUar5+76PVCmYl" crossorigin="anonymous"></scr' + 'ipt>'+
								'<scr' + 'ipt src="https://cdnjs.cloudflare.com/ajax/libs/jstat/1.7.1/jstat.min.js"></scr' + 'ipt>'+

								'<scr' + 'ipt src="https://code.jquery.com/ui/1.12.1/jquery-ui.min.js" integrity="sha256-VazP97ZCwtekAsvgPBSUwPFKdrwD3unUfSGVYrahUqU="   crossorigin="anonymous"></scr' + 'ipt>'+
								'<scr' + 'ipt src = "https://cdnjs.cloudflare.com/ajax/libs/bootbox.js/4.4.0/bootbox.min.js"></scr' + 'ipt>'+
								'<scr' + 'ipt src = "https://cdnjs.cloudflare.com/ajax/libs/PapaParse/4.6.1/papaparse.min.js"></scr' + 'ipt>'+
								'<scr' + 'ipt src = "https://cdnjs.cloudflare.com/ajax/libs/echarts/4.0.4/echarts.min.js"></scr' + 'ipt>'+
								'<scr' + 'ipt src = "https://cdnjs.cloudflare.com/ajax/libs/Chart.js/1.0.2/Chart.min.js"></scr' + 'ipt>';
