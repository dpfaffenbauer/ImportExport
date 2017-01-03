/**
 * ImportExport Pimcore Plugin
 *
 * LICENSE
 *
 * This source file is subject to the GNU General Public License version 3 (GPLv3)
 * For the full copyright and license information, please view the LICENSE.md and gpl-3.0.txt
 * files that are distributed with this source code.
 *
 * @copyright  Copyright (c) 2015-2017 Dominik Pfaffenbauer (https://www.pfaffenbauer.at)
 * @license    https://github.com/dpfaffenbauer/pimcore-ImportExport/blob/master/LICENSE.md     GNU General Public License version 3 (GPLv3)
 */

pimcore.registerNS("pimcore.plugin.importexport");

pimcore.plugin.importexport = Class.create(pimcore.plugin.admin, {
    getClassName: function() {
        return "pimcore.plugin.importexport";
    },

    initialize: function() {
        pimcore.plugin.broker.registerPlugin(this);
    },

    pimcoreReady: function (params, broker) {

        var user = pimcore.globalmanager.get('user');

        if(user.isAllowed('plugins')) {

            var exportMenu = new Ext.Action({
                text: t('importexport_export'),
                iconCls: 'pimcore_icon_export',
                handler:this.openExport
            });

            var importMenu = new Ext.Action({
                text: t('importexport_import'),
                iconCls: 'pimcore_icon_import',
                handler:this.openImport
            });

            layoutToolbar.settingsMenu.add(exportMenu);
            layoutToolbar.settingsMenu.add(importMenu);

        }

    },

    openExport : function()
    {
        try {
            pimcore.globalmanager.get('importexport_export').activate();
        }
        catch (e) {
            pimcore.globalmanager.add('importexport_export', new pimcore.plugin.importexport.export());
        }
    },

    openImport : function()
    {
        try {
            pimcore.globalmanager.get('importexport_import').activate();
        }
        catch (e) {
            pimcore.globalmanager.add('importexport_import', new pimcore.plugin.importexport.import());
        }
    }
});

var importexportPlugin = new pimcore.plugin.importexport();

