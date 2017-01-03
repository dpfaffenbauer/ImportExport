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

class ImportExport_ExportController extends \Pimcore\Controller\Action\Admin
{

    public function exportAction()
    {
        $folder = $this->getParam("folder");
        $classes = $this->getParam("allowedClasses", array());
        $types = $this->getParam("allowedTypes", array());
        $unpublished = $this->getParam("unpublished");

        $exportFolder = \Pimcore\Model\Object\Folder::getByPath($folder);

        if($exportFolder instanceof \Pimcore\Model\Object\Folder) {
            $bulkExportData = \ImportExport\Export::bulkExport($exportFolder, $unpublished, $classes, $types);
            $fileName = "export-" . time() . ".json";

            header("Content-type: application/javascript");
            header("Content-Disposition: attachment; filename=$fileName");
            header("Pragma: no-cache");
            header("Expires: 0");

            echo json_encode($bulkExportData, JSON_PRETTY_PRINT);
            exit;
        }
        else {
            $this->_helper->json(array("success" => false, "message" => sprintf("Folder does not exist")));
        }
    }

    public function bulkExportAction() {
        $coreShopData = \Pimcore\Model\Object\Folder::getByPath("/coreshop");

        $bulkExportData = \ImportExport\Export::bulkExport($coreShopData, false, array("Pimcore\\Model\\Object\\Folder", "Pimcore\\Model\\Object\\CoreShopProduct"));

        print_r(json_encode($bulkExportData));exit;
    }
}
