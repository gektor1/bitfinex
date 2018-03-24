angular.module('alertApp', [])
        .controller('AlertController', ['$scope', '$http', '$interval', '$location', '$window', function ($scope, $http, $interval, $location, $window) {

//                $scope.audio = new Audio('http://www.freesfx.co.uk/rx2/mp3s/6/18580_1464796418.mp3');
                $scope.audio = new Audio('http://www.freesfx.co.uk/rx2/mp3s/2/13654_1459784657.mp3'); //http://www.freesfx.co.uk/soundeffects/all_bells/?p=1

                $scope.alert = false;
                $scope.request = false;
                
                $scope.intervals = 10000;
                
                $scope.currencies = ["BTCUSD","LTCUSD","LTCBTC","ETHUSD","ETHBTC","ETCBTC","ETCUSD","RRTUSD","RRTBTC","ZECUSD","ZECBTC","XMRUSD",
                    "XMRBTC","DSHUSD","DSHBTC","BTCEUR","XRPUSD","XRPBTC","IOTUSD","IOTBTC","IOTETH","EOSUSD","EOSBTC","EOSETH","SANUSD","SANBTC",
                    "SANETH","OMGUSD","OMGBTC","OMGETH","BCHUSD","BCHBTC","BCHETH","NEOUSD","NEOBTC","NEOETH","ETPUSD","ETPBTC","ETPETH","QTMUSD",
                    "QTMBTC","QTMETH","AVTUSD","AVTBTC","AVTETH","EDOUSD","EDOBTC","EDOETH","BTGUSD","BTGBTC","DATUSD","DATBTC","DATETH","QSHUSD",
                    "QSHBTC","QSHETH","YYWUSD","YYWBTC","YYWETH","GNTUSD","GNTBTC","GNTETH","SNTUSD","SNTBTC","SNTETH","IOTEUR","BATUSD","BATBTC",
                    "BATETH","MNAUSD","MNABTC","MNAETH","FUNUSD","FUNBTC","FUNETH","ZRXUSD","ZRXBTC","ZRXETH","TNBUSD","TNBBTC","TNBETH","SPKUSD",
                    "SPKBTC","SPKETH","TRXUSD","TRXBTC","TRXETH","RCNUSD","RCNBTC","RCNETH","RLCUSD","RLCBTC","RLCETH","AIDUSD","AIDBTC","AIDETH",
                    "SNGUSD","SNGBTC","SNGETH","REPUSD","REPBTC","REPETH","ELFUSD","ELFBTC","ELFETH"];
                
//                $scope.currency = location.search.replace(/^.*?\=/, '');
                $scope.currency = 'BTCUSD';

                if (!$scope.currency) {
                    return false;
                }

                document.title = $scope.currency;

                $scope.input = {};
                $scope.result = {
                    min: 0,
                    max: 0,
                    last: 0
                };
                $scope.trades = {
                    hist: [],
                    count: []
                };

                $scope.interval;

                $scope.start = function () {
                    if ($scope.interval != null)
                        return;

                    $scope.interval = $interval(function () {
                        $scope.request = true;

                        var query = '?limit=1000';
                        if ($scope.input.n) {
                            var unix = (new Date).getTime();
                            query += '&start=' + (unix - $scope.input.n * 60 * 1000)
                        }

                        $http.get('https://api.bitfinex.com/v2/trades/t' + $scope.currency + '/hist' + query).then(function (rows) {
                            for (i in rows.data) {
                                var exist = false;
                                for (h in $scope.trades.hist) {
                                    if ($scope.trades.hist[h][0] == rows.data[i][0]) exist = true;
                                }
                                if (!exist) $scope.trades.hist.push(rows.data[i]);
                            }
                            $scope.trades.hist.sort(function(a, b) { 
                                return a[0] > b[0] ? -1 : 1;
                            });

//                            $scope.trades.hist = rows.data;

                            $scope.calc();
                            $scope.request = false;
                            
                            if ($scope.trades.hist.length >= 10000) {
                                $scope.trades.hist.splice(-1000,1000);
                            }
                            
                        });
                    }, $scope.intervals);
                };

                $scope.stop = function () {
                    if (angular.isDefined($scope.interval) && $scope.interval != null) {
                        $interval.cancel($scope.interval);
                        $scope.interval = null;
                    }
                };

                $scope.calc = function () {
                    if ($scope.trades.hist) {
                        $scope.trades.count = [];
                        angular.forEach($scope.trades.hist, function (value, key) {
                            var price = value[3];
                            var timestamp = value[1];
                            
                            var d1 = new Date(timestamp);
                            var d2 = new Date( Date.now() - $scope.input.n * 1000 * 60 );

                            if (d2 <= d1) {
                                $scope.trades.count.push(value);
                                if (key == 0) {
                                    $scope.result.last = price;
                                    $scope.result.min = price;
                                    $scope.result.max = price;
                                } else {
                                    $scope.result.min = Math.min($scope.result.min, price);
                                    $scope.result.max = Math.max($scope.result.max, price);
                                }
                            }
                        });

                        if (
                                (($scope.result.max - $scope.result.last) / $scope.result.max * 100) > $scope.input.k ||
                                (($scope.result.last - $scope.result.min) / $scope.result.min * 100) > $scope.input.k
                                ) {
                            $scope.alert = true;
                            
                            document.title = '!!' + $scope.currency + '!!';
                            
                            $scope.audio.play();
                        } else {
                            $scope.alert = false;
                            
                            document.title = $scope.currency;
                        }
                    }
                };

                $scope.$watch("input.k", function (newValue, oldValue) {
                    $scope.calc();
                });
                $scope.$watch("input.n", function (newValue, oldValue) {
                    $scope.calc();
                });
                $scope.$watch("currency", function (newValue, oldValue) {
                    $scope.result = {
                        min: 0,
                        max: 0,
                        last: 0
                    };
                    $scope.trades.hist = [];
                    $scope.trades.count = [];
                });

                $scope.start();
            }]);