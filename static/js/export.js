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

pimcore.registerNS('pimcore.plugin.importexport.export');

pimcore.plugin.importexport.export = Class.create({

    layoutId: 'importexport_export',
    iconCls : 'pimcore_icon_export',

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
                title: t('importexport_export'),
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

        var classesStore = new Ext.data.JsonStore({
            autoDestroy: true,
            proxy: {
                type: 'ajax',
                url: '/admin/class/get-tree'
            },
            fields: ["text"]
        });
        classesStore.load();

        var objectTypeStore = Ext.create('Ext.data.ArrayStore', {
            fields: [
                'id',
                'text'
            ],
            data : [
                ['variant', t('variants')],
                ['folder', t('folder')],
                ['object', t('object')]
            ]
        });

        this.exportForm = new Ext.form.Panel({
            bodyStyle: 'padding:10px;',
            autoScroll: true,
            region : 'center',
            defaults : {
                labelWidth : 200
            },
            border:false,
            buttons: [
                {
                    text: t('export'),
                    handler: this.save.bind(this),
                    iconCls: 'pimcore_icon_apply'
                }
            ],
            items: [
                {
                    fieldLabel: t('folder'),
                    name: 'folder',
                    cls: 'input_drop_target',
                    width: 500,
                    xtype: 'textfield',
                    listeners: {
                        render: function (el) {
                            new Ext.dd.DropZone(el.getEl(), {
                                reference: this,
                                ddGroup: 'element',
                                getTargetFromEvent: function (e) {
                                    return this.getEl();
                                }.bind(el),

                                onNodeOver : function (target, dd, e, data) {
                                    data = data.records[0].data;

                                    if (data.elementType == 'object') {
                                        return Ext.dd.DropZone.prototype.dropAllowed;
                                    }

                                    return Ext.dd.DropZone.prototype.dropNotAllowed;
                                },

                                onNodeDrop : function (target, dd, e, data) {
                                    data = data.records[0].data;

                                    if (data.elementType == 'object') {
                                        this.setValue(data.path);
                                        return true;
                                    }

                                    return false;
                                }.bind(el)
                            });
                        }
                    }
                },
                new Ext.ux.form.MultiSelect({
                    fieldLabel: t("allowed_classes") + '<br />' + t('allowed_types_hint'),
                    name: "allowedClasses[]",
                    displayField: "text",
                    valueField: "text",
                    store: classesStore,
                    width: 500
                }),
                new Ext.ux.form.MultiSelect({
                    fieldLabel: t("allowed_types") + '<br />' + t('allowed_types_hint'),
                    name: "allowedTypes[]",
                    store: objectTypeStore,
                    width: 500,
                    displayField: "text",
                    valueField: "id"
                }),
                {
                    fieldLabel: t('export_unpublished'),
                    xtype: 'checkbox',
                    name: 'unpublished'
                }
            ]
        });

        return this.exportForm;
    },

    save: function () {
        var values = this.exportForm.getForm().getFieldValues();
        var path = "/plugin/ImportExport/export/export?" + Ext.Object.toQueryString (values);

        pimcore.helpers.download(path);
    }
});
