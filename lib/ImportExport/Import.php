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
 * @copyright  Copyright (c) 2015 Dominik Pfaffenbauer (http://dominik.pfaffenbauer.at)
 * @license    https://github.com/dpfaffenbauer/pimcore-ImportExport/blob/master/LICENSE.md     GNU General Public License version 3 (GPLv3)
 */

namespace ImportExport;

use Pimcore\Model\Object\AbstractObject;
use Pimcore\Model\Object\ClassDefinition\Data\Fieldcollections;
use Pimcore\Model\Object\Concrete;
use Pimcore\Tool;

class Import {

    /**
     * Overwrite existing data
     */
    const IMPORT_MODE_OVERWRITE = 0;

    /**
     * Delete existing data
     */
    const IMPORT_MODE_DELETE = 1;

    /**
     * ignore existing data
     */
    const IMPORT_MODE_IGNORE = 2;

    /**
     * Import data to pimcore
     *
     * @param $data
     * @param $mode
     *
     * @return Concrete
     * @throws \Exception
     */
    public static function importObject($data, $mode) {
        $className = $data->classname;
        $elements = $data->elements;

        if(Tool::classExists($className)) {
            $object = null;

            if ($data->id) {
                $object = $className::getById($data->id);
            }

            if($object instanceof $className) {
                if($mode === self::IMPORT_MODE_IGNORE)
                {
                    throw new \Exception(sprintf("Object with ID %d already exists and import mode is to ignore it.", $data->id));
                }
                else if($mode === self::IMPORT_MODE_DELETE) {
                    $object->delete();
                    $object = null;
                }
            }

            if(!$object instanceof $className) {
                $object = new $className();
            }

            if($object instanceof AbstractObject) {
                if (is_array($elements)) {
                    foreach ($elements as $element) {
                        $class = $object->getClass();

                        $setter = "set" . ucfirst($element->name);
                        if (method_exists($object, $setter)) {
                            $tag = $class->getFieldDefinition($element->name);
                            if ($tag) {
                                if ($element->value) {
                                    if ($class instanceof Fieldcollections) {
                                        $object->$setter($tag->getFromWebserviceImport($element->fieldcollection, $object, array()));
                                    } else {
                                        $object->$setter($tag->getFromWebserviceImport($element->value, $object, array()));
                                    }
                                }
                            } else {
                                \Logger::error("tag for field " . $element->name . " not found");
                            }
                        } else {

                        }
                    }
                }
            }

            foreach(get_object_vars($data) as $key=>$value) {
                if($key === "elements" || $key === "classname" || $key === "id")
                    continue;

                $setter = "set" . ucfirst($key);

                if(method_exists($object, $setter)) {
                    $object->$setter($value);
                }
            }

            $object->save();

            return $object;
        }

        throw new \Exception(sprintf("class with name %s not found"), $className);
    }
}