var objConfig = {
	urls: {
		dynamicresourceurl: 'https://www.livesimproved.philips.com/tools/dynamic_resources_cached_closed.aspx',
		authurl1: "https://www.livesimproved.philips.com/pages/login/login.aspx",
		authurl2: "https://www.livesimproved.philips.com/tools/dynamic_resources.aspx",
		authurl3: "https://www.livesimproved.philips.com/pages/login/authenticate_user.aspx",
	},
	colors:{
		philips: {
			low: '#7DABF1',
			middle: '#3D7FDF',
			high: '#0b5ed7' 
		},
		PD0900: {
			low: '#99EAF0',
			middle: '#30B6BF',
			high: '#2badb5'		
		},
		PD0100: {
			low: '#CBF277',
			middle: '#98C833',
			high: '#7dba00'   		
		},
		PD0200:{
			low: '#BE67E9',
			middle: '#8737B0',
			high: '#68049c'  		
		}

	},
	hideinactivecountries: true,
	defaultmru: 'philips',
	defaultoru: '3',
	snapshots: null,
	currentsnapshotid: 'nothing'
}