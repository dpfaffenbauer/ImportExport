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

pimcore.registerNS('pimcore.plugin.importexport.import');

pimcore.plugin.importexport.import = Class.create({

    layoutId: 'importexport_import',
    iconCls : 'pimcore_icon_import',

    initialize: function () {
        // create layout
        this.getLayout();

        this.panels = [];
    },

    activate: function () {
        var tabPanel = Ext.getCmp('pimcore_panel_tabs');
        tabPanel.setActiveItem(this.layoutId);
    },

    getLayout: function () {
        if (!this.layout) {

            // create new panel
            this.layout = new Ext.Panel({
                id: this.layoutId,
                title: t('importexport_import'),
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
        this.importForm = new Ext.form.Panel({
            bodyStyle: 'padding:10px;',
            autoScroll: true,
            region : 'center',
            defaults : {
                labelWidth : 200
            },
            border:false,
            buttons: [
                {
                    text: t('import'),
                    handler: this.import.bind(this),
                    iconCls: 'pimcore_icon_apply'
                }
            ],
            items: 
            [
                {
                    xtype: 'fileuploadfield',
                    emptyText: t("select_a_file"),
                    fieldLabel: t("file"),
                    width: 500,
                    name: "Filedata",
                    buttonText: "",
                    buttonConfig: {
                        iconCls: 'pimcore_icon_upload'
                    }
                },
                {
                    fieldLabel: t('import_mode'),
                    name: 'mode',
                    width: 500,
                    xtype: 'combo',
                    store: [[0, t('mode_overwrite')], [1, t('mode_delete')], [2, t('mode_ignore')], [3, t('mode_create_new')]],
                    value : 0,
                    triggerAction: 'all',
                    typeAhead: false,
                    editable: false,
                    forceSelection: true,
                    queryMode: 'local'
                },
                {
                    fieldLabel: t('dryrun'),
                    xtype: 'checkbox',
                    name: 'dryRun',
                    checked : true,
                    value : true
                }
            ]
        });
        
        return this.importForm;
    },

    import : function() {
        this.importForm.getForm().submit({
            url: '/plugin/ImportExport/import/import',
            waitMsg: t("please_wait"),
            success: function (el, res) {
                this.parseResponse(res.response.responseText);
            }.bind(this),
            failure: function (el, res) {
                pimcore.helpers.showNotification(t('error'), t('error'), 'error', t('unkown'));
            }
        });
    },

    parseResponse : function(response) {
        response = Ext.decode(response);

        var store = new Ext.data.Store({
            fields: response.columns,
            data : response.objects
        });

        new pimcore.plugin.importexport.importresult(Ext.id(), store, response.gridColumns);
    }
});
