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

namespace ImportExport;

use Pimcore\Model\Object\AbstractObject;
use Pimcore\Model\Object\ClassDefinition\Data\Classificationstore;
use Pimcore\Model\Object\Concrete;
use Pimcore\Model\Webservice\Data\Object\Element;

class Export {

    /**
     * @var array System Columns that are going to be exported
     */
    protected static $objectSystemColumnsNames = array("id", "fullpath", "published", "key", "classname");

    /**
     * Export a product to php-array
     *
     * @param AbstractObject $object
     * @return array
     */
    public static function exportObject(AbstractObject $object) {
        $elements = array();

        if($object instanceof Concrete) {
            $fd = $object->getClass()->getFieldDefinitions();

            foreach ($fd as $field) {
                $getter = "get" . ucfirst($field->getName());

                if ($field instanceof Classificationstore)
                    continue;

                //only expose fields which have a get method
                if (method_exists($object, $getter)) {
                    $el = new Element();
                    $el->name = $field->getName();
                    $el->type = $field->getFieldType();

                    $el->value = $field->getForWebserviceExport($object);

                    $elements[] = $el;
                }
            }
        }

        $exportData = array(
            "elements" => $elements,
            "classname" => get_class($object),
            "path" => $object->getPath()
        );

        foreach(self::$objectSystemColumnsNames as $systemColumn) {
            $getter = "get" . ucfirst($systemColumn);

            if(method_exists($object, $getter)) {
                if($systemColumn === "classname") {
                    $exportData[$systemColumn] = "\\Pimcore\\Model\\Object\\" . $object->$getter();
                }
                else {
                    $exportData[$systemColumn] = $object->$getter();
                }
            }
        }

        return $exportData;
    }

    protected static $exportData = array();

    /**
     * @param AbstractObject $object
     * @param boolean $unpublished Export unpublished objects
     * @param array $objectTypes Object Types of classes
     * @param array $classTypes Types Of Classes
     *
     * @return array
     */
    public static function bulkExport(AbstractObject $object, $unpublished = false, $classTypes = array(), $objectTypes = array(AbstractObject::OBJECT_TYPE_FOLDER, AbstractObject::OBJECT_TYPE_OBJECT, AbstractObject::OBJECT_TYPE_VARIANT)) {
        $className = get_class($object);
        $doExport = false;

        if(count($classTypes) > 0) {
            $classParts = explode("\\", $className);
            $className = $classParts[count($classParts) - 1];

            if(in_array($className, $classTypes)) {
                $doExport = true;
            }
        }
        else {
            $doExport = true;
        }

        if($doExport) {
            self::$exportData[] = self::exportObject($object);
        }

        $childs = $object->getChilds($objectTypes, $unpublished);

        foreach($childs as $child) {
            self::bulkExport($child, $unpublished, $classTypes, $objectTypes);
        }

        return self::$exportData;
    }
}