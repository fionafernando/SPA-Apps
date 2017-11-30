define('route-config',
    ['config', 'router', 'vm.shell'],
    function (config, router, shell) {
        var logger = config.logger,
            register = function () {
                var routeData = [
                    // Dashboard routes
                    {
                        view: config.viewIds.dashboard,
                        routes:
                        [
                            {
                                isDefault: true,
                                route: config.hashes.mainMenu.dashboard,
                                title: 'Dashboard',
                                callback: shell.activate,
                                group: '.route-top'
                            }
                        ]
                    }                   
                ];

                for (var i = 0; i < routeData.length; i++) {
                    router.register(routeData[i]);
                }

                // Crank up the router
                router.run();
            };

        return {
            register: register
        };
    });