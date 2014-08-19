!function(){"use strict";var app=angular.module("racepoint",["ngRoute"]);app.config(["$routeProvider",function($routeProvider){$routeProvider.when("/",{controller:"GatewayController",templateUrl:"views/gateway.html"}).when("/teams",{controller:"TeamsController",templateUrl:"views/teams/list.html"}).when("/teams/add",{controller:"AddTeamController",templateUrl:"views/teams/add.html"}).when("/teams/:id",{controller:"TeamController",templateUrl:"views/teams/single.html"}).otherwise({redirectTo:"/"})}]),app.config(["$httpProvider",function($httpProvider){$httpProvider.responseInterceptors.push("httpInterceptor")}]),app.run(["$rootScope","messageService",function($rootScope,messageService){$rootScope.$on("$routeChangeSuccess",function(){}),$rootScope.$on("$routeChangeError",function(){messageService.setError("The app wanted to commit suicide.")})}])}(),function(){"use strict";var AddTeamController=function($scope,$location,messageService,authHttp){$scope.team={name:"",players:[{name:""},{name:""},{name:""},{name:""}]},$scope.submit=function(){var players=[];angular.forEach($scope.team.players,function(player){players.push(player.name)}),authHttp({url:"/teams/",method:"PUT",data:{name:$scope.team.name,players:players}}).success(function(){messageService.setDone("Team added!"),$location.path("/teams")}).error(function(data,status){messageService.setError(400==status?data:"Could not talk to server.")})}};angular.module("racepoint").controller("AddTeamController",AddTeamController)}(),function(){"use strict";var GatewayController=function($scope,$http,$location,messageService,apiUrl,auth){$scope.input={password:""},$scope.submit=function(){messageService.setInfo("Loading..."),$http({url:apiUrl+"/auth/",method:"POST",data:$scope.input}).success(function(data){auth.setToken(data.token),$location.path("REG"==data.role?"/teams":"/logbook")}).error(function(data,status){messageService.setError(400==status?data:"Could not talk to server.")})}};angular.module("racepoint").controller("GatewayController",GatewayController)}(),function(){"use strict";var TeamController=function($scope,$routeParams,$location,messageService,teamList,authHttp){$scope.team=teamList.getTeam($routeParams.id),$scope.remove=function(){authHttp({url:"/teams/",method:"DELETE",data:{id:parseInt($routeParams.id)}}).success(function(){messageService.setDone("Team deleted."),$location.path("/teams")}).error(function(data){messageService.setError(data)})}};angular.module("racepoint").controller("TeamController",TeamController)}(),function(){"use strict";var TeamsController=function($scope,messageService,teamList){$scope.teams=[];var promise=teamList.load();promise.then(function(){$scope.teams=teamList.getAll()},function(error){messageService.setError(error)})};angular.module("racepoint").controller("TeamsController",TeamsController)}(),function(){"use strict";var messageBarDirective=function(messageService){return{restrict:"E",templateUrl:"views/helpers/message.html",link:function(scope){scope.message={type:"",text:""},scope.$watch(function(){return messageService.message.text},function(){scope.message.type=messageService.message.type,scope.message.text=messageService.message.text}),scope.clear=function(){messageService.clear()}}}};angular.module("racepoint").directive("messageBar",messageBarDirective)}(),function(){"use strict";var apiUrlFactory=function(){var apiUrl="";return apiUrl=0===window.location.search.indexOf("?local")?"http://localhost:8000/api":"http://racepoint.yatcode.com/api","http://localhost:8000/api"},authFactory=function(){var Auth={token:!1,init:function(){localStorage.getItem("authToken")&&(Auth.token=localStorage.getItem("authToken"))},setToken:function(newToken){Auth.token=newToken,localStorage.setItem("authToken",newToken)},getToken:function(){return Auth.token},clear:function(){Auth.token="",localStorage.removeItem("authToken")}};return Auth.init(),Auth},authHttpFactory=function($http,apiUrl,auth){var authHttp=function(config){return config.url=apiUrl+config.url,config.headers=config.headers||{},config.headers["Racepoint-Token"]=auth.getToken(),$http(config)};return authHttp},httpInterceptorFactory=function($q,$location,messageService,auth){var httpInterceptor=function(promise){return promise.then(function(response){return response},function(response){return 403==response.status&&(messageService.setError("Your session has expired."),auth.clear(),$location.path("/")),$q.reject(response)})};return httpInterceptor};angular.module("racepoint").factory("apiUrl",apiUrlFactory).factory("auth",authFactory).factory("authHttp",authHttpFactory).factory("httpInterceptor",httpInterceptorFactory)}(),function(){"use strict";var messageServiceFactory=function($timeout){var MessageService={promise:null,message:{type:"",text:""},setMessage:function(message){MessageService.message.text=message,MessageService.promise=$timeout(function(){MessageService.message.type="",MessageService.message.text=""},5e3)},setError:function(message){MessageService.message.type="error",MessageService.setMessage(message)},setInfo:function(message){MessageService.message.type="info",MessageService.setMessage(message)},setDone:function(message){MessageService.message.type="done",MessageService.setMessage(message)},clear:function(){MessageService.message.type="",MessageService.message.text="",$timeout.cancel(MessageService.promise)}};return MessageService};angular.module("racepoint").factory("messageService",messageServiceFactory)}(),function(){"use strict";var teamListFactory=function($q,authHttp){var TeamList={teams:[],init:function(){localStorage.getItem("teamList")&&(TeamList.teams=angular.fromJson(localStorage.getItem("teamList")))},load:function(){var deferred=$q.defer();return authHttp({url:"/teams/",method:"GET"}).success(function(data){TeamList.teams=data,localStorage.setItem("teamList",angular.toJson(data)),deferred.resolve()}).error(function(data){deferred.reject(data)}),deferred.promise},getAll:function(){return TeamList.teams},getTeam:function(teamId){for(var i=0;i<=TeamList.teams.length;i++)if(TeamList.teams[i].id==teamId)return TeamList.teams[i];return null},clear:function(){TeamList.teams=[],localStorage.removeItem("teamList")}};return TeamList.init(),TeamList};angular.module("racepoint").factory("teamList",teamListFactory)}();