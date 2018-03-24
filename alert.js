angular.module('alertApp', [])
        .controller('AlertController', ['$scope', '$http', '$interval', function ($scope, $http, $interval) {

                $scope.audio = new Audio('http://www.freesfx.co.uk/rx2/mp3s/6/18580_1464796418.mp3');

                $scope.alert = false;
                $scope.request = false;

                $scope.input = {};
                $scope.result = {
                    min: 0,
                    max: 0,
                    last: 0
                };
                $scope.trades = {
                    hist: null
                };

                $scope.interval;

                $scope.start = function () {
                    if (angular.isDefined($scope.interval))
                        return;

                    $scope.interval = $interval(function () {
                        $scope.request = true;

                        var query = '?limit=1000';
                        if ($scope.input.n) {
                            var unix = (new Date).getTime();
                            query += '&start=' + (unix - $scope.input.n * 60 * 1000)
                        }

                        $http.get('https://api.bitfinex.com/v2/trades/tBTCUSD/hist' + query).then(function (rows) {
                            $scope.trades.hist = rows.data;
                            $scope.calc();
                            $scope.request = false;
                        });
                    }, 10000);
                };

                $scope.stop = function () {
                    if (angular.isDefined($scope.interval)) {
                        $interval.cancel($scope.interval);
                        $scope.interval = null;
                    }
                };

                $scope.calc = function () {
                    if ($scope.trades.hist) {
                        angular.forEach($scope.trades.hist, function (value, key) {
                            var price = value[3];
                            if (key == 0) {
                                $scope.result.last = price;
                                $scope.result.min = price;
                                $scope.result.max = price;
                            } else {
                                $scope.result.min = Math.min($scope.result.min, price);
                                $scope.result.max = Math.max($scope.result.max, price);
                            }
                        });

                        if (
                                (($scope.result.max - $scope.result.last) / $scope.result.max * 100) > $scope.input.k ||
                                (($scope.result.last - $scope.result.min) / $scope.result.min * 100) > $scope.input.k
                                ) {
                            $scope.alert = true;
                            $scope.audio.play();
                        } else {
                            $scope.alert = false;
                        }
                    }
                };

                $scope.$watch("input.k", function (newValue, oldValue) {
                    $scope.calc();
                });

                $scope.start();
            }]);