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

pimcore.registerNS('pimcore.plugin.importexport.importresult');

pimcore.plugin.importexport.importresult = Class.create({

    layoutId: 'importexport_import_result',
    iconCls : 'pimcore_icon_import',

    initialize: function (id, store, columns) {
        // create layout
        this.layoutId += id;
        this.store = store;
        this.columns = columns;

        this.getLayout();
    },

    getLayout: function () {
        if (!this.layout) {

            // create new panel
            this.layout = new Ext.Panel({
                id: this.layoutId,
                title: t('importexport_import_result'),
                iconCls: this.iconCls,
                border: false,
                layout: 'border',
                closable: true,
                items: this.getItems()
            });

            // add event listener
            var layoutId = this.layoutId;
            this.layout.on('destroy', function () {
                pimcore.globalmanager.remove(layoutId);
            }.bind(this));

            // add panel to pimcore panel tabs
            var tabPanel = Ext.getCmp('pimcore_panel_tabs');
            tabPanel.add(this.layout);
            tabPanel.setActiveItem(this.layoutId);

            // update layout
            pimcore.layout.refresh();
        }

        return this.layout;
    },

    getItems : function () {
        this.grid = new Ext.grid.Panel({
            bodyStyle: 'padding:10px;',
            autoScroll: true,
            region : 'center',
            defaults : {
                labelWidth : 200
            },
            border:false,
            columns : this.columns,
            store : this.store
        });

        return this.grid;
    }
});
