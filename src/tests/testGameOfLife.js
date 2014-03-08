YUI({ logInclude: { TestRunner: true } }).use('test', 'test-console',
    function (Y) {
        var test_WorldMapNeighborPoints = new Y.Test.Case(
            {
                name: "WorldMap NeighborPoints Test",
                testSimple: function() {
                    var wm = new GameOfLife(100, 100, 2, 2);
                    var neighbors = wm.getNeighborPoints(0, 0);
                    var expected = [[1, 0], [1, 1], [0, 1]];
                    Y.Assert.isTrue(_.isEqual(neighbors, expected),
                        "expected :" + expected.toSource()
                        + " got : " + neighbors.toSource());
                }
            }
        );

        Y.Test.Runner.add(test_WorldMapNeighborPoints);

        var test_WorldMapNeighborValues = new Y.Test.Case(
            {
                name: "WorldMap NeighborValues Test",
                testSimple: function() {
                    var mapArray = [[0, 1, 2],
                                    [3, 4, 5],
                                    [6, 7, 8]];
                    var gol = new GameOfLife(100, 100, 3, 3);
                    gol.worldMap = mapArray;
                    var neighbors = gol.getNeighborValues(1, 1);
                    var expected = [1, 2, 5, 8, 7, 6, 3, 0];
                    Y.Assert.isTrue(_.isEqual(neighbors, expected),
                        "expected : " + expected.toSource()
                        + "got : " + neighbors.toSource());
                }
            }
        );


        Y.Test.Runner.add(test_WorldMapNeighborValues);

        var test_getSumOfLivingNeighbors = new Y.Test.Case(
            {
                name: "LivingNeighborsSumTest",
                testSimple: function() {
                    var gol = new GameOfLife(100, 100, 3, 3);
                    gol.toggleSquareColor(0, 0);
                    gol.toggleSquareColor(0, 2);
                    gol.toggleSquareColor(2, 0);
                    gol.toggleSquareColor(2, 2);
                    var sumLiveNeighbors = gol.getSumOfLiveNeighbors(1, 1);
                    Y.Assert.isTrue(4 == sumLiveNeighbors,
                        "wrong number of live neighbors");
                }
            });

        Y.Test.Runner.add(test_getSumOfLivingNeighbors);

        (new Y.Test.Console({
            newestOnTop: false
        })).render('#log');

        Y.Test.Runner.run();
    });
