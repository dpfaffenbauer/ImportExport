<?php
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

class ImportExport_ImportController extends \Pimcore\Controller\Action\Admin
{
    public function importAction() {
        $json = file_get_contents($_FILES["Filedata"]["tmp_name"]);
        $dryRun = $this->getParam("dryRun") === "on";
        $mode = intval($this->getParam("mode", \ImportExport\Import::IMPORT_MODE_OVERWRITE));

        $data = json_decode($json);

        $objects = \ImportExport\Import::importDump($data, $dryRun, $mode);

        $columns = array();
        $gridColumns = array();
        $data = array();

        foreach($objects as $object) {
            $objectData = array();

            if(is_object($object)) $object = get_object_vars($object);

            if(array_key_exists("localizedfields", $object)) {
                foreach($object['localizedfields']->getItems() as $lang => $items) {
                    foreach($items as $item => $itemValue) {
                        $object[$lang.'.'.$item] = $itemValue;
                    }
                }
            }

            foreach($object as $key => $value) {

                if(is_object($value))
                    continue;

                if(!in_array($key, $columns) && $value && !is_object($value) && !is_array($value)) {
                    $columns[] = $key;

                    $gridColumns[] = array(
                        "dataIndex" => $key,
                        "text" => $key
                    );
                }

                if($value) {
                    $objectData[$key] = $value;
                }
            }

            $data[] = $objectData;
        }


        $this->_helper->json(array("success" => true, "objects" => $data, "columns" => $columns, "gridColumns" => $gridColumns));
    }
}